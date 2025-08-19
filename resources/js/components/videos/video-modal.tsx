import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type VideoType = { id: number; title: string; description?: string | null; file_path?: string };
type ModalProps = {
  isModalVisible: boolean;
  onClose: (open: boolean) => void;
  video?: VideoType | null;
};

export default function VideoModal({ isModalVisible, onClose, video }: ModalProps) {
  const isEditMode = !!video;

  const { data, setData, post, processing, errors, reset } = useForm({
    title: video?.title || '',
    description: video?.description || '',
    file_path: null as File | null,
  });

  useEffect(() => {
    if (isEditMode) {
      setData({
        title: video!.title,
        description: video!.description || '',
        file_path: null,
      });
    } else {
      reset();
    }
  }, [isModalVisible, video]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditMode) {
      // Use POST request with method spoofing for file uploads
      post(route('videos.update', video!.id), {
        data: {
          ...data,
          _method: 'put',
        },
        forceFormData: true,
        onSuccess: () => {
          onClose(false);
        },
      });
    } else {
      // Keep POST for creating
      post(route('videos.store'), {
        forceFormData: true,
        onSuccess: () => {
          onClose(false);
        },
      });
    }
  };

  return (
    <Dialog open={isModalVisible} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Video' : 'Upload Video'}</DialogTitle>
          <DialogDescription>{isEditMode ? 'Update video details.' : 'Upload a new video file.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} className="col-span-3" />
              {errors.title && <p className="col-span-4 text-red-500 text-sm">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} className="col-span-3" />
              {errors.description && <p className="col-span-4 text-red-500 text-sm">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file_path">File</Label>
              <Input id="file_path" type="file" accept="video/*" onChange={(e) => setData('file_path', e.target.files?.[0] ?? null)} className="col-span-3" />
              {errors.file_path && <p className="col-span-4 text-red-500 text-sm">{errors.file_path}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={processing}>{isEditMode ? 'Update' : 'Upload'}</Button>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}