import { PortfolioEditor } from "../PortfolioEditor";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Nuevo proyecto</h1>
      <PortfolioEditor project={null} submitLabel="Crear proyecto" />
    </div>
  );
}
