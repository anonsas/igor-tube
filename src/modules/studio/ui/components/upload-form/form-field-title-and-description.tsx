import { Loader2Icon, SparklesIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form";

interface Props {
  form: UseFormReturn;
  isButtonDisabled: boolean;
  isTitlePending: boolean;
  isDescriptionPending: boolean;
  onGenerateTitle: () => void;
  onGenerateDescription: () => void;
}

export function FormFieldTitleAndDescription({
  form,
  isButtonDisabled,
  isTitlePending,
  isDescriptionPending,
  onGenerateTitle,
  onGenerateDescription,
}: Props) {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-x-2">
                Title
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-full size-6 [&_svg]:size-3"
                  onClick={onGenerateTitle}
                  disabled={isTitlePending || isButtonDisabled}
                >
                  {isTitlePending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                </Button>
              </div>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Add a title to your video" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-x-2">
                Description
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-full size-6 [&_svg]:size-3"
                  onClick={onGenerateDescription}
                  disabled={isDescriptionPending || isButtonDisabled}
                >
                  {isDescriptionPending ? <Loader2Icon className="animate-spin" /> : <SparklesIcon />}
                </Button>
              </div>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                rows={10}
                className="resize-none pr-10"
                placeholder="Add a description to your video"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
