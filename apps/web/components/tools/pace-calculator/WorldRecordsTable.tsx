type RecordRow = {
  event: string;
  menTime: string;
  menHolder: string;
  menYear: string;
  womenTime: string;
  womenHolder: string;
  womenYear: string;
};

export default function WorldRecordsTable({ rows, menLabel, womenLabel }: { rows: RecordRow[]; menLabel: string; womenLabel: string }) {
  return (
    <div dir="ltr" className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-current/30 text-start">
            <th className="px-3 py-2 text-start font-semibold" />
            <th className="px-3 py-2 text-start font-semibold">{menLabel}</th>
            <th className="px-3 py-2 text-start font-semibold">{womenLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.event} className="border-b border-current/10">
              <td className="px-3 py-2.5 font-semibold">{row.event}</td>
              <td className="px-3 py-2.5">
                <span className="font-mono font-semibold">{row.menTime}</span>
                <span className="block text-xs opacity-70">
                  {row.menHolder}, {row.menYear}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <span className="font-mono font-semibold">{row.womenTime}</span>
                <span className="block text-xs opacity-70">
                  {row.womenHolder}, {row.womenYear}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
