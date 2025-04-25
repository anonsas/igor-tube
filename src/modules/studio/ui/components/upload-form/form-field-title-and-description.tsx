import { UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form";

interface Props {
  form: UseFormReturn;
}

export function FormFieldTitleAndDescription({ form }: Props) {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel> {/*TODO ADD AI Generated button */}
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
            <FormLabel>Description</FormLabel> {/*TODO ADD AI Generated button */}
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
