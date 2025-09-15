// import React from "react";
// import * as Select from "@radix-ui/react-select";
// import { ChevronDown, Check } from "lucide-react";
// import { useLanguage } from "../context/LanguageContext";

// export default function LanguageSelect({ className = "", onChange }) {
//   const { locale, setLocale, languages, savingLanguage } = useLanguage();

//   const handleChange = async (val) => {
//     await setLocale(val);
//     onChange?.(val);
//   };

//   const current = languages.find(l => l.code === locale) || languages[0];

//   return (
//     <div className={["inline-flex items-center gap-2", className].join(" ")}>
//       <Select.Root value={locale} onValueChange={handleChange}>
//         <Select.Trigger
//           aria-label="Select language"
//           className="inline-flex items-center justify-between min-w-[220px]
//                      rounded-xl border border-gray-200 bg-white px-3 py-2
//                      shadow-sm hover:bg-gray-50 focus:outline-none
//                      focus:ring-2 focus:ring-indigo-500/50"
//         >
//           <Select.Value>
//             <span className="inline-flex items-center gap-2">
//               <span className="text-xl">{current.flag}</span>
//               <span className="font-medium">{current.label}</span>
//             </span>
//           </Select.Value>
//           <Select.Icon className="ml-2 opacity-60">
//             <ChevronDown size={16} />
//           </Select.Icon>
//         </Select.Trigger>

//         <Select.Portal>
//           <Select.Content
//             sideOffset={6}
//             className="z-50 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
//           >
//             <Select.Viewport className="p-1">
//               {languages.map((l) => (
//                 <Select.Item
//                   key={l.code}
//                   value={l.code}
//                   className="group relative flex w-full cursor-pointer items-center gap-2
//                              select-none rounded-lg px-3 py-2 text-sm text-gray-800
//                              outline-none data-[highlighted]:bg-indigo-50
//                              data-[highlighted]:text-indigo-700"
//                 >
//                   <Select.ItemText>
//                     <span className="inline-flex items-center gap-2">
//                       <span className="text-xl">{l.flag}</span>
//                       <span>{l.label}</span>
//                     </span>
//                   </Select.ItemText>
//                   <Select.ItemIndicator className="ml-auto opacity-80">
//                     <Check size={16} />
//                   </Select.ItemIndicator>
//                 </Select.Item>
//               ))}
//             </Select.Viewport>
//           </Select.Content>
//         </Select.Portal>
//       </Select.Root>

//       {savingLanguage && <span className="text-sm opacity-70">Saving…</span>}
//     </div>
//   );
// }


import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { CircleFlag } from "react-circle-flags";
import { useLanguage } from "../context/LanguageContext";

// соответствие языка кода страны для круглого флага
const FLAG_CODE = { en: "gb", ru: "ru", he: "il" };

// Аккуратный флаг фиксированного размера
function Flag({ code, size = 18 }) {
  return (
    <span
      className="inline-flex items-center justify-center overflow-hidden rounded-full shrink-0"
      style={{ width: size, height: size }}
    >
      <CircleFlag
        countryCode={FLAG_CODE[code] || "un"}
        height={size}                 // число, чтобы не тянулось
        style={{ display: "block" }}  // убираем наследование max-width: 100%
      />
    </span>
  );
}

export default function LanguageSelect({ className = "", onChange }) {
  const { locale, setLocale, languages, savingLanguage } = useLanguage();

  const handleChange = async (val) => {
    await setLocale(val);
    onChange?.(val);
  };

  const current = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className={["inline-flex items-center gap-2", className].join(" ")}>
      <Select.Root value={locale} onValueChange={handleChange}>
        <Select.Trigger
          aria-label="Select language"
          className="inline-flex items-center justify-between min-w-[200px]
                     rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm
                     hover:bg-gray-50 focus:outline-none
                     focus:ring-2 focus:ring-indigo-500/50"
        >
          <Select.Value>
            <span className="inline-flex items-center gap-2">
              <Flag code={current.code} />
              <span className="font-medium">{current.label}</span>
            </span>
          </Select.Value>
          <Select.Icon className="ml-2 opacity-60">
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            sideOffset={6}
            className="z-50 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
          >
            <Select.Viewport className="p-1">
              {languages.map((l) => (
                <Select.Item
                  key={l.code}
                  value={l.code}
                  className="group relative flex w-full cursor-pointer items-center gap-2
                             select-none rounded-lg px-3 py-2 text-sm text-gray-800
                             outline-none data-[highlighted]:bg-indigo-50
                             data-[highlighted]:text-indigo-700"
                >
                  <Select.ItemText>
                    <span className="inline-flex items-center gap-2">
                      <Flag code={l.code} />
                      <span>{l.label}</span>
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator className="ml-auto opacity-80">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {savingLanguage && <span className="text-sm opacity-70">Saving…</span>}
    </div>
  );
}
