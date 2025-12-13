import { Suspense } from "react";
import AddVehicleForm from "./add-vehicle-form";

async function ErrorDisplay({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params?.error) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 pt-6">
      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
        Error: {params.error}
      </div>
    </div>
  );
}

export default function AddVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <ErrorDisplay searchParams={searchParams} />
      </Suspense>
      <AddVehicleForm />
    </>
  );
}
