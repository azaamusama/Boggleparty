import QRCode from "react-qr-code";

type QRJoinCardProps = {
  joinUrl: string;
};

export function QRJoinCard({ joinUrl }: QRJoinCardProps) {
  return (
    <div className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_20px_60px_rgba(13,51,86,0.14)]">
      <p className="text-lg font-bold text-slate-900">Scan to join</p>
      <p className="mt-2 text-sm text-slate-600">Players can hop in on their phones instantly.</p>
      <div className="mt-5 flex justify-center rounded-[1.5rem] bg-white p-4">
        <QRCode size={180} value={joinUrl} />
      </div>
      <p className="mt-4 break-all text-xs text-slate-500">{joinUrl}</p>
    </div>
  );
}
