import { UseFormReturn } from "react-hook-form";
import { Globe2Icon, LockIcon } from "lucide-react";

import { FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

interface Props {
  form: UseFormReturn;
}

export function FormFieldVisibility({ form }: Props) {
  return (
    <FormField
      control={form.control}
      name="visibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Visibility</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center">
                  <Globe2Icon className="siz-4 mr-2" /> Public
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center">
                  <LockIcon className="siz-4 mr-2" />
                  Private
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
