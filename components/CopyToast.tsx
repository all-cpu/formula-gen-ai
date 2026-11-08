type CopyToastProps = {
  visible: boolean;
  message: string;
};

export default function CopyToast({ visible, message }: CopyToastProps) {
  return (
    <div
      role="status"
      aria-hidden={!visible}
      className={`pointer-events-none absolute top-3 right-3 z-10 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {message}
    </div>
  );
}
