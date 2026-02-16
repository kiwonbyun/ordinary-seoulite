import { useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";

type BoardBodyEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onImageUpload: (file: File) => Promise<string>;
};

export function BoardBodyEditor({ value, onChange, onImageUpload }: BoardBodyEditorProps) {
  const editorRef = useRef<ReactQuill | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/jpeg,image/png,image/webp";
            input.click();

            input.onchange = async () => {
              const file = input.files?.[0];
              const editor = editorRef.current?.getEditor();
              if (!file || !editor) return;

              try {
                const imageUrl = await onImageUpload(file);
                const range = editor.getSelection(true);
                const index = range?.index ?? editor.getLength();
                editor.insertEmbed(index, "image", imageUrl, "user");
                editor.setSelection(index + 1);
              } catch (uploadError) {
                const message = uploadError instanceof Error ? uploadError.message : "Failed to upload image.";
                toast.error(message);
              }
            };
          },
        },
      },
    }),
    [onImageUpload],
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "link",
    "image",
    "code-block",
  ];

  return <ReactQuill ref={editorRef} className="board-editor" theme="snow" value={value} onChange={onChange} modules={modules} formats={formats} />;
}
