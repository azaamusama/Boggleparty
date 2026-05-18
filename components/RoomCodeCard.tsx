type RoomCodeCardProps = {
  roomCode: string;
  label?: string;
};

export function RoomCodeCard({ roomCode, label = "Room code" }: RoomCodeCardProps) {
  return (
    <div className="rounded-[2rem] border border-white/50 bg-white/90 p-6 shadow-[0_25px_80px_rgba(19,38,63,0.14)] backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-[0.4em] text-slate-900 sm:text-6xl">
        {roomCode}
      </p>
    </div>
  );
}
