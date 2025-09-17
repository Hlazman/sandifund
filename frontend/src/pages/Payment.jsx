
// import React from "react";
// import Card from "../components/Card";

// export default function Payment() {
//   return (
//     <div className="max-w-5xl mx-auto p-4">
//       <Card title="Payment">
//         <p className="text-sm opacity-80">
//           Здесь будет оплата/подписка.
//         </p>
//       </Card>
//     </div>
//   );
// }

import React from "react";
import { useNavigate } from "react-router-dom";

export default function Payment() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Оплата (в разработке)</h1>
      <p className="mb-6">Здесь позже появится выбор тарифа и оплата.</p>
      <button
        className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
        onClick={() => navigate("/")}
      >
        Далее
      </button>
    </div>
  );
}
