type Props = {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

const PAGE_SIZE = 10;

export function ColumnPagination({ page, total, onPrev, onNext }: Props) {
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
      >
        Prev
      </button>
      <span>
        Page {page} / {maxPage}
      </span>
      <button
        onClick={onNext}
        disabled={page >= maxPage}
        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
      >
        Next
      </button>
    </div>
  );
}
