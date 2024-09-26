import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/table";
import { useDebounce } from "react-use";
import { format } from "date-fns";
import { RiArrowDownSFill } from "react-icons/ri";
import ReactPaginate from "react-paginate";
import { Article, articlesList } from "./api";
import { client } from "./client";

const HEADERS = [
  { key: "title", text: "Title", isOrderable: false },
  { key: "summary", text: "Summary", isOrderable: false },
  { key: "news_site", text: "News site", isOrderable: false },
  { key: "published_at", text: "Published at", isOrderable: true },
  { key: "updated_at", text: "Updated at", isOrderable: true },
];

const OFFSET = 10;

const useArticles = (page: number, search?: string, ordering?: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [count, setCount] = useState(0);

  const offset = page * OFFSET;

  useEffect(() => {
    setIsLoading(true);

    articlesList({ client, query: { offset, search, ordering } })
      .then(({ data, error }) => {
        if (error) setIsError(true);
        setArticles(data?.results ?? []);
        setCount(data?.count ?? 0);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [offset, search, ordering]);

  return { articles, isLoading, isError, count };
};

function App() {
  const [inputText, setInputText] = useState<string | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [ordering, setOrdering] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  const { articles, isLoading, isError, count } = useArticles(
    page,
    search,
    ordering
  );

  const maxPage = Math.ceil(count / OFFSET);

  useDebounce(
    () => {
      setSearch(inputText);
      setPage(0);
    },
    1000,
    [inputText]
  );

  return (
    <div>
      <div className="max-w-5xl mx-auto px-2 py-8 flex flex-col gap-8">
        <div className="flex gap-4">
          <input
            type="search"
            className="border outline-none focus:ring-2 focus:ring-offset-2 rounded focus:ring-blue-500 px-2 py-1 bg-gray-50"
            placeholder="Search articles"
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>

        {isError && (
          <div className="flex justify-center">
            <h5 className="text-red-600">An unknown error has happened</h5>
          </div>
        )}

        {!isError && (
          <>
            {articles.length > 0 && (
              <div className="w-full flex justify-between items-center">
                <Pagination page={page} maxPage={maxPage} setPage={setPage} />
                <p>
                  <span className="font-semibold">{count}</span> articles
                </p>
              </div>
            )}

            <Table>
              <TableHead>
                <TableRow>
                  {HEADERS.map(({ key, text, isOrderable }) => (
                    <TableHeader key={key}>
                      <TableHeaderContent
                        articleKey={key}
                        text={text}
                        isOrderable={isOrderable}
                        ordering={ordering}
                        setOrdering={setOrdering}
                      />
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading && <ArticlesSkeleton />}
                {!isLoading &&
                  articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>{article.title}</TableCell>
                      <TableCell>{article.summary}</TableCell>
                      <TableCell>{article.news_site}</TableCell>
                      <TableCell>
                        {format(new Date(article.published_at), "MM/dd/yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(article.updated_at), "MM/dd/yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        )}

        {!isLoading && !isError && articles.length === 0 && (
          <div className="flex justify-center">
            <h5>No articles found.</h5>
          </div>
        )}
      </div>
    </div>
  );
}

const TableHeaderContent = ({
  articleKey,
  text,
  isOrderable,
  ordering,
  setOrdering,
}: {
  articleKey: string;
  text: string;
  isOrderable: boolean;
  ordering?: string;
  setOrdering: (ordering: string | undefined) => void;
}) => {
  return isOrderable ? (
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={() =>
        setOrdering(ordering === articleKey ? undefined : articleKey)
      }
    >
      <h3>{text}</h3>
      <div>{ordering === articleKey && <RiArrowDownSFill />}</div>
    </div>
  ) : (
    <div className="flex">
      <h3>{text}</h3>
    </div>
  );
};

const Pagination = ({
  page,
  maxPage,
  setPage,
}: {
  page: number;
  maxPage: number;
  setPage: (page: number) => void;
}) => {
  return (
    <ReactPaginate
      forcePage={page}
      onPageChange={({ selected }) => setPage(selected)}
      pageCount={maxPage}
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      containerClassName="flex gap-2 justify-center"
      pageClassName="px-2 py-1 bg-slate-50 border rounded-lg"
      pageLinkClassName="outline-none"
      activeLinkClassName="text-blue-600 font-semibold"
      previousClassName="px-2 py-1 bg-slate-50 border rounded-lg"
      nextClassName="px-2 py-1 bg-slate-50 border rounded-lg"
      breakClassName="px-2 py-1 bg-slate-50 border rounded-lg"
      previousLabel="Previous"
      nextLabel="Next"
      breakLabel="..."
    />
  );
};

const ArticlesSkeleton = () => {
  return (
    <>
      {[...Array(10)].map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {[...Array(5)].map((_, cellIndex) => (
            <TableCell key={`skeleton-row-${cellIndex}`}>
              <div className="animate-pulse bg-gray-200 h-4 w-3/4 m-4 rounded"></div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

export default App;
