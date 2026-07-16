import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import AppLayout from "../components/feature/AppLayout";
import Dashboard from "../pages/dashboard/page";
import WorkspacePage from "../pages/workspace/page";
import TriageDetail from "../pages/detail/page";
import TodoCenter from "../pages/todo/page";
import HistoryEvents from "../pages/history/page";
import ReviewCenter from "../pages/review/page";
import Permissions from "../pages/permissions/page";
import EvaluationPage from "../pages/evaluation/page";
import KnowledgeLayout from "../pages/knowledge/components/KnowledgeLayout";
import KnowledgeOverview from "../pages/knowledge/overview/page";
import KnowledgeSpaces from "../pages/knowledge/spaces/page";
import DocumentDetail from "../pages/knowledge/document-detail/page";
import RetrievalTest from "../pages/knowledge/retrieval-test/page";
import KnowledgeReview from "../pages/knowledge/review/page";
import UsageRecords from "../pages/knowledge/usage/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "triage",
        element: <WorkspacePage />,
      },
      {
        path: "triage/:id",
        element: <TriageDetail />,
      },
      {
        path: "todo",
        element: <TodoCenter />,
      },
      {
        path: "history",
        element: <HistoryEvents />,
      },
      {
        path: "review",
        element: <ReviewCenter />,
      },
      {
        path: "permissions",
        element: <Permissions />,
      },
      {
        path: "evaluation",
        element: <EvaluationPage />,
      },
      {
        path: "knowledge",
        element: <KnowledgeLayout />,
        children: [
          {
            index: true,
            element: <KnowledgeOverview />,
          },
          {
            path: "spaces",
            element: <KnowledgeSpaces />,
          },
          {
            path: "document/:docId",
            element: <DocumentDetail />,
          },
          {
            path: "retrieval-test",
            element: <RetrievalTest />,
          },
          {
            path: "review",
            element: <KnowledgeReview />,
          },
          {
            path: "usage",
            element: <UsageRecords />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;