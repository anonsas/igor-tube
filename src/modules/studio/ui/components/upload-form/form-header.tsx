import { MoreVerticalIcon, TrashIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Props {
  isButtonDisabled: boolean;
  onDeleteVideo: () => void;
}

export function FormHeader({ isButtonDisabled, onDeleteVideo }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold">Video details</h1>
        <p className="text-sm text-muted-foreground">Manage your video details</p>
      </div>

      <div className="flex items-center gap-x-2">
        <Button type="submit" disabled={isButtonDisabled}>
          Save
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDeleteVideo}>
              <TrashIcon className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
