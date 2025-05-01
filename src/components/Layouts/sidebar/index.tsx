import ConversationList from "./ConversationList";

export function Sidebar({
  onSelectConversation,
  selectedId,
}: {
  onSelectConversation: (id: string) => void;
  selectedId?: string | null;
}) {
  return (
    <aside className="w-[280px] border-r border-gray-200 dark:border-gray-800 h-screen overflow-y-auto">
      <ConversationList
        onSelectConversation={onSelectConversation}
        selectedId={selectedId}
      />
    </aside>
  );
}
