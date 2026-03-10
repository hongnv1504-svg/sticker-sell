import { API_BASE } from './constants';

export interface JobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stickers: Array<{
    id: string;
    emotion: string;
    imageUrl: string;
    thumbnailUrl: string;
  }>;
  isPaid: boolean;
}

export async function uploadImage(imageUri: string, packId: string): Promise<string> {
  const filename = imageUri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri: imageUri, name: filename, type: mimeType } as any);
  formData.append('packId', packId);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? 'Upload failed');
  return data.jobId as string;
}

export async function startGeneration(jobId: string): Promise<void> {
  // Fire-and-forget — server runs generation for up to 5 min
  fetch(`${API_BASE}/api/generate/${jobId}`, { method: 'POST' }).catch(() => {});
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/api/job/${jobId}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) throw new Error(`Status check failed (${res.status})`);

  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? 'Failed to get status');

  return {
    status: data.job.status as JobStatus['status'],
    progress: data.job.progress ?? 0,
    stickers: (data.stickers ?? []).map((s: any) => ({
      id: s.id,
      emotion: s.emotion,
      imageUrl: s.imageUrl,
      thumbnailUrl: s.thumbnailUrl ?? s.imageUrl,
    })),
    isPaid: data.isPaid ?? false,
  };
}
