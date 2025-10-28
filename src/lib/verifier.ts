import type { SupabaseClient } from '@supabase/supabase-js';

export type VerificationKind = 'identity' | 'property';

export interface IdentityVerificationPayload {
  userId: string;
  documentFile: File;
  selfieFile: File;
}

export interface PropertyVerificationPayload {
  userId: string;
  propertyId: number;
  address: string;
  proofFile: File;
}

export interface VerificationResult {
  status: 'pending' | 'approved' | 'rejected';
  message: string;
}

export interface Verifier {
  submitIdentityVerification(payload: IdentityVerificationPayload): Promise<VerificationResult>;
  submitPropertyVerification(payload: PropertyVerificationPayload): Promise<VerificationResult>;
}

type UploadParams = {
  bucket: string;
  path: string;
  file: File;
};

export class SupabaseManualVerifier implements Verifier {
  constructor(private readonly supabase: SupabaseClient) {}

  private async getCurrentUserId(expectedId?: string) {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    const sessionUserId = data.session?.user?.id;
    if (!sessionUserId) {
      throw new Error('Necesitas iniciar sesión de nuevo para continuar con la verificación.');
    }
    if (expectedId && expectedId !== sessionUserId) {
      console.warn('El userId aportado no coincide con la sesión activa. Usando el de la sesión para cumplir RLS.');
    }
    return sessionUserId;
  }

  private async uploadFile({ bucket, path, file }: UploadParams) {
    const { error } = await this.supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
    return path;
  }

  async submitIdentityVerification(payload: IdentityVerificationPayload): Promise<VerificationResult> {
    const sessionUserId = await this.getCurrentUserId(payload.userId);
    const timestamp = Date.now();
    const bucket = 'verifications';
    const documentPath = `identity/${sessionUserId}/document-${timestamp}-${payload.documentFile.name}`;
    const selfiePath = `identity/${sessionUserId}/selfie-${timestamp}-${payload.selfieFile.name}`;

    await this.uploadFile({ bucket, path: documentPath, file: payload.documentFile });
    await this.uploadFile({ bucket, path: selfiePath, file: payload.selfieFile });

    const { error: insertError } = await this.supabase.from('verifications').insert({
      user_id: sessionUserId,
      kind: 'identity',
      document_path: documentPath,
      selfie_path: selfiePath,
      status: 'pending',
    });
    if (insertError) throw insertError;

    const { error: profileError } = await this.supabase
      .from('profiles')
      .update({
        verification_status: 'pending',
        verification_type: 'identity',
        is_verified: false,
      })
      .eq('id', sessionUserId);
    if (profileError) throw profileError;

    return { status: 'pending', message: 'Documentos enviados. Revisaremos tu identidad muy pronto.' };
  }

  async submitPropertyVerification(payload: PropertyVerificationPayload): Promise<VerificationResult> {
    const sessionUserId = await this.getCurrentUserId(payload.userId);
    const timestamp = Date.now();
    const bucket = 'verifications';
    const proofPath = `property/${sessionUserId}/proof-${timestamp}-${payload.proofFile.name}`;

    await this.uploadFile({ bucket, path: proofPath, file: payload.proofFile });

    const { error: insertError } = await this.supabase.from('verifications').insert({
      user_id: sessionUserId,
      property_id: payload.propertyId,
      kind: 'property',
      document_path: proofPath,
      submitted_address: payload.address,
      status: 'pending',
    });
    if (insertError) throw insertError;

    const { error: profileError } = await this.supabase
      .from('profiles')
      .update({
        verification_status: 'pending',
        verification_type: 'property',
      })
      .eq('id', sessionUserId);
    if (profileError) throw profileError;

    return { status: 'pending', message: 'Recibimos tu documento de propiedad. Lo revisaremos en breve.' };
  }
}
