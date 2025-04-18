import { FormSection } from "../sections/form-section";

interface Props {
  videoId: string;
}

export function VideoView({ videoId }: Props) {
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg">
      <FormSection videoId={videoId} />
    </div>
  );
}
