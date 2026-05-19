import { getInventoryItems } from "./actions";
import InventoryList from "./InventoryList";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const items = await getInventoryItems(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stok ve Depo Yönetimi</h1>
          <p className="text-slate-500 dark:text-slate-400">İlaç ve tıbbi sarf malzemelerinin stok durumunu, miktarını ve maliyetlerini takip edin.</p>
        </div>
      </div>

      <InventoryList initialItems={items} />
    </div>
  );
}
