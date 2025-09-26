import React from "react";
import Link from "next/link";
import { createSlug } from "@/lib/airtable-utils";

interface BookAttachmentThumb {
  url?: string;
  width?: number;
  height?: number;
}
interface BookAttachment {
  thumbnails?: {
    large?: BookAttachmentThumb;
  };
}
interface BookFields {
  bookName?: string;
  desc?: string | string[];
  publishingDate?: string;
  book?: BookAttachment[];
  id?: string; // Airtable record id in fields? (keeping original shape)
  [key: string]: any;
}
interface BookRecord {
  fields: BookFields;
  id?: string; // Top-level Airtable record id
}

interface CardProps {
  data: BookRecord;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const Card: React.FC<CardProps> = ({ data }) => {
  const { fields } = data;
  const { bookName, publishingDate, book, id: fieldId, desc, writer, slugId } = fields;
  const recordId = fieldId || data.id; // prefer fields.id, fallback to record.id
  const image = book?.[0]?.thumbnails?.large;

  // Use slugId if available, otherwise create slug from book name
  const bookSlug = slugId || (bookName ? `${createSlug(bookName)}` : recordId);

  return (
    <Link href={{ pathname: `/E-Books/${bookSlug}/${recordId}` }}>
      <div className="rounded overflow-hidden shadow-lg mx-auto border border-border bg-background text-foreground">
        <div className="relative bg-cover bg-center w-[200px] h-[260px]">
          {image?.url && (
            <img
              className="h-full w-full object-cover"
              src={image.url}
              height={image.height}
              width={image.width}
              alt={bookName || "Book cover"}
              loading="lazy"
            />
          )}
        </div>
        <div className="px-6">
          <div className="pt-2 font-medium text-primary dark:text-secondary">{bookName} <span className="text-muted-foreground">:{writer}</span></div>
          <div className="text-sm text-muted-foreground">{Array.isArray(desc) ? desc.join(" ") : desc}</div>
          <div className="flex items-center mb-2 text-sm text-muted-foreground">
            اشاعت: {formatDate(publishingDate).split("/")[2] || formatDate(publishingDate).split("/")[0] || publishingDate}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;