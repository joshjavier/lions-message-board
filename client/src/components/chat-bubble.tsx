export function ChatBubble({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {/* Avatar */}
      {/* <img */}
      {/*   className="h-8 w-8 rounded-full" */}
      {/*   src="https://picsum.photos/32" */}
      {/*   alt="Jese image" */}
      {/* /> */}
      <div className="flex w-full max-w-[320px] flex-col rounded-xl bg-slate-100 px-4 py-3">
        {/* Name and timestamp */}
        <div className="flex items-center space-x-1.5 pb-2.5 rtl:space-x-reverse">
          <span className="text-sm font-semibold">Bonnie Green</span>
          {/* <span className="text-body text-sm">11:46</span> */}
        </div>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
