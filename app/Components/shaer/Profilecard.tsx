import Link from "next/link";
import { createSlug } from "@/lib/airtable-utils";

type Photo = {
  thumbnails?: {
    full?: { url?: string; height?: number; width?: number };
  };
};

type CardProps = {
  // Accept any incoming record shape; component only reads limited fields
  data: any;
};

const Card = ({ data }: CardProps) => {
  const { fields, id: recordId } = data;
  const { takhallus, photo, slugId } = fields;

  const img = photo?.[0]?.thumbnails?.full as
    | { url?: string; height?: number; width?: number }
    | undefined;
  const name = (takhallus || "").replace(" ", "-");

  // Use slugId if available, otherwise create slug from takhallus and record ID
  const shaerSlug = slugId || (takhallus ? `${createSlug(takhallus)}` : recordId);

  return (
    <Link href={{ pathname: `/Shaer/${name}` }}>
      <div className="w-[180px] h-[205px] rounded overflow-hidden shadow-[#00000080] shadow-md mx-auto my-1">
        <div
          className="relative bg-cover bg-center"
          style={{ backgroundImage: `url(/poets/loadingpic.gif)` }}
        >
          {img?.url ? (
            <img
              className="w-full h-52 object-cover object-center"
              src={img.url}
              height={img.height}
              width={img.width}
              alt="Poet's Photo"
            />
          ) : (
            <img
              className="w-full h-52 object-cover object-center"
              src={"/poets/nodp.jpg"}
              height={180}
              width={180}
              alt="Poet's Photo"
            />
          )}
          <div className="absolute bottom-0 w-full text-center p-2 bg-black/40 text-white backdrop-blur-sm" style={{ WebkitBackdropFilter: 'blur(4px)' }}>
            {takhallus}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;