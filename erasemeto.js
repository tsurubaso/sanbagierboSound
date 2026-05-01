// src/pages/Editor.jsx
import { useParams } from "react-router-dom";
import BookEditor from "@/components/BookEditor.jsx";

export default function EditorPage() {
  const { link } = useParams(); // filename without .md

  return <BookEditor book={link} />;
}   