import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import type { Dispatch, SetStateAction } from "react";
import { ImagePlusIcon, MoreVerticalIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormLabel, FormItem } from "@/components/ui/form";

interface Props {
  form: UseFormReturn;
  thumbnailUrl: string;
  onRestoreThumbnail: () => void;
  onGenerateThumbnail: () => void;
  setIsThumbnailModalOpen: Dispatch<SetStateAction<boolean>>;
}

export function FormFieldThumbnail({
  form,
  thumbnailUrl,
  onRestoreThumbnail,
  onGenerateThumbnail,
  setIsThumbnailModalOpen,
}: Props) {
  return (
    <FormField
      control={form.control}
      name="thumbnailUrl"
      render={() => (
        <FormItem>
          <FormLabel>Thumbnail</FormLabel>
          <FormControl>
            <div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
              <Image src={thumbnailUrl} fill alt="thumbnail" className="object-cover" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                  >
                    <MoreVerticalIcon className="text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right">
                  <DropdownMenuItem onClick={() => setIsThumbnailModalOpen(true)}>
                    <ImagePlusIcon className="size-4 mr-1" />
                    Change
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onGenerateThumbnail()}>
                    <SparklesIcon className="size-4 mr-1" />
                    AI-generated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRestoreThumbnail}>
                    <RotateCcwIcon className="size-4 mr-1" />
                    Restore
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
