import { useParams } from "react-router-dom";
import MergerPageClient from "@/components/MergerPageClient";

export default function MergerPage(){
  const { link } = useParams(); // filename without .md
  console.log("merger link value: "+link)

  return <MergerPageClient book={link} />;
}   