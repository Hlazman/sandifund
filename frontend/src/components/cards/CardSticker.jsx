import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { ImageBox, ButtonLink } from "./_CardParts";

export default function CardSticker(props) {
  const {
    className = "",
    title,
    image,
    description,
    zipHref, // абсолютная или относительная ссылка на zip
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3 ${className}`}>
      {image ? (
        <img src={image} alt={title || ""} className="w-full aspect-[4/3] object-cover rounded-xl border" />
      ) : (
        <ImageBox />
      )}

      <h3 className="text-lg font-semibold leading-tight">{title || "Untitled sticker pack"}</h3>

      {description ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{description}</p> : null}

      {zipHref ? (
        <div className="pt-1">
          <ButtonLink href={zipHref} download fullWidth>
            {L("card.sticker.download", "Скачать")}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
