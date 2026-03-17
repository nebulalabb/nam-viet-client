import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/views/admin/attendance/AttendancePage.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fd328351"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=fd328351"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useState = __vite__cjsImport1_react["useState"]; const useMemo = __vite__cjsImport1_react["useMemo"]; const useEffect = __vite__cjsImport1_react["useEffect"]; const useCallback = __vite__cjsImport1_react["useCallback"];
import { useDispatch, useSelector } from "/node_modules/.vite/deps/react-redux.js?v=fd328351";
import { getMyAttendance, getAttendanceList, getAttendanceStatistics, approveLeave, rejectLeave } from "/src/stores/AttendanceSlice.jsx";
import { getUsers } from "/src/stores/UserSlice.jsx";
import AttendanceCalendar from "/src/views/admin/attendance/components/AttendanceCalendar.jsx";
import AttendanceMonthlyMatrix from "/src/views/admin/attendance/components/AttendanceMonthlyMatrix.jsx";
import DailyStatsCard from "/src/views/admin/attendance/components/DailyStatsCard.jsx";
import AttendanceApprovalsTab from "/src/views/admin/attendance/components/AttendanceApprovalsTab.jsx";
import AttendanceToolbar from "/src/views/admin/attendance/components/AttendanceToolbar.jsx";
import GenerateQRDialog from "/src/views/admin/attendance/components/GenerateQRDialog.jsx";
import RequestLeaveDialog from "/src/views/admin/attendance/components/RequestLeaveDialog.jsx";
import AttendanceEditDialog from "/src/views/admin/attendance/components/AttendanceEditDialog.jsx";
import AttendanceStatusBadge, {
  TimeDisplay,
  WorkHoursDisplay,
  LeaveTypeDisplay
} from "/src/views/admin/attendance/components/AttendanceStatus.jsx";
import MonthPicker from "/src/views/admin/attendance/components/MonthPicker.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "/src/components/ui/popover.jsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "/src/components/ui/command.jsx";
import { cn } from "/src/lib/utils.js";
import {
  Calendar,
  List,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Grid3x3,
  CheckCircle2,
  QrCode,
  Edit2,
  ChevronsUpDown,
  Check
} from "/node_modules/.vite/deps/lucide-react.js?v=fd328351";
function ClassicCard({ title, value, icon, color, description }) {
  const Icon = icon;
  const colorClasses = {
    green: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    red: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    blue: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    purple: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30"
  };
  const iconClass = colorClasses[color] || colorClasses.blue;
  return /* @__PURE__ */ jsxDEV("div", { className: "rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxDEV("div", { className: `flex h-12 w-12 items-center justify-center rounded-lg ${iconClass}`, children: /* @__PURE__ */ jsxDEV(Icon, { className: "h-6 w-6" }, void 0, false, {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 52,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 51,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: title }, void 0, false, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 55,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: value }, void 0, false, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 56,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 54,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 50,
      columnNumber: 13
    }, this),
    description && /* @__PURE__ */ jsxDEV("div", { className: "mt-4 text-sm text-gray-500 dark:text-gray-400", children: description }, void 0, false, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 60,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
    lineNumber: 49,
    columnNumber: 5
  }, this);
}
_c = ClassicCard;
export default function AttendancePage() {
  _s();
  const dispatch = useDispatch();
  const [viewMode, setViewMode] = useState("matrix");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = /* @__PURE__ */ new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedUserId, setSelectedUserId] = useState("me");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showRequestLeave, setShowRequestLeave] = useState(false);
  const [editDialogRecord, setEditDialogRecord] = useState(null);
  const [openUserCombobox, setOpenUserCombobox] = useState(false);
  const { attendanceList, myAttendance, statistics, loading } = useSelector((state) => state.attendance);
  const { users } = useSelector((state) => state.user);
  const authUser = useSelector((state) => state.auth?.authUserWithRoleHasPermissions);
  const isMyView = selectedUserId === "me";
  const isAllView = selectedUserId === "all";
  const monthFormatted = selectedMonth.replace("-", "");
  const displayedUsers = useMemo(() => {
    if (isMyView) return authUser ? [authUser] : [{ id: 0, fullName: "Của tôi" }];
    if (isAllView) return users;
    return users.filter((u) => u.id === selectedUserId);
  }, [isMyView, isAllView, users, authUser, selectedUserId]);
  useEffect(() => {
    dispatch(getUsers({ status: "active" }));
  }, [dispatch]);
  const loadData = useCallback(() => {
    if (isMyView) {
      dispatch(getMyAttendance({ month: monthFormatted }));
    } else if (isAllView) {
      dispatch(getAttendanceList({ month: monthFormatted }));
    } else {
      dispatch(getAttendanceList({ userId: selectedUserId, month: monthFormatted }));
    }
    dispatch(getAttendanceStatistics({
      month: monthFormatted,
      userId: isMyView || isAllView ? void 0 : selectedUserId
    }));
  }, [dispatch, isMyView, isAllView, monthFormatted, selectedUserId]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  const rawAttendances = isMyView ? myAttendance : attendanceList;
  const attendances = Array.isArray(rawAttendances) ? rawAttendances : [];
  const filteredAttendances = useMemo(() => {
    if (!selectedDate || viewMode !== "list") return attendances;
    return attendances.filter((att) => {
      if (!att.date) return false;
      const dateStr = new Date(att.date).toISOString().split("T")[0];
      return dateStr === selectedDate;
    });
  }, [attendances, selectedDate, viewMode]);
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setViewMode("list");
  };
  const handleApproveLeave = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn duyệt yêu cầu này?")) {
      dispatch(approveLeave(id));
    }
  };
  const handleRejectLeave = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) {
      dispatch(rejectLeave(id));
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-6 h-full overflow-y-auto pb-10 pr-2", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Chấm công" }, void 0, false, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 155,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Quản lý và theo dõi chấm công nhân viên" }, void 0, false, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 156,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 154,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setShowRequestLeave(true),
            className: "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
            children: [
              /* @__PURE__ */ jsxDEV(Calendar, { className: "h-4 w-4" }, void 0, false, {
                fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                lineNumber: 166,
                columnNumber: 25
              }, this),
              "Xin nghỉ phép"
            ]
          },
          void 0,
          true,
          {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 162,
            columnNumber: 21
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setShowQRDialog(true),
            className: "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors",
            children: [
              /* @__PURE__ */ jsxDEV(QrCode, { className: "h-4 w-4" }, void 0, false, {
                fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                lineNumber: 175,
                columnNumber: 25
              }, this),
              "Tạo QR"
            ]
          },
          void 0,
          true,
          {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 171,
            columnNumber: 21
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 rounded-lg border border-gray-200 p-1 dark:border-gray-700", children: [
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setViewMode("matrix"),
              className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === "matrix" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`,
              children: [
                /* @__PURE__ */ jsxDEV(Grid3x3, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                  lineNumber: 188,
                  columnNumber: 29
                }, this),
                "Bảng công"
              ]
            },
            void 0,
            true,
            {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 181,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setViewMode("calendar"),
              className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === "calendar" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`,
              children: [
                /* @__PURE__ */ jsxDEV(Calendar, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                  lineNumber: 198,
                  columnNumber: 29
                }, this),
                "Lịch"
              ]
            },
            void 0,
            true,
            {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 191,
              columnNumber: 25
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setViewMode("list"),
              className: `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`,
              children: [
                /* @__PURE__ */ jsxDEV(List, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                  lineNumber: 208,
                  columnNumber: 29
                }, this),
                "Danh sách"
              ]
            },
            void 0,
            true,
            {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 201,
              columnNumber: 25
            },
            this
          )
        ] }, void 0, true, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 180,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 161,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 153,
      columnNumber: 13
    }, this),
    statistics && /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxDEV(
        ClassicCard,
        {
          title: "Ngày Có Mặt",
          value: statistics?.presentDays || 0,
          icon: UserCheck,
          color: "green",
          description: "Nhân viên đã chấm công"
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 218,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        ClassicCard,
        {
          title: "Ngày Vắng",
          value: statistics?.absentDays || 0,
          icon: UserX,
          color: "red",
          description: "Nhân viên vắng mặt"
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 226,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        ClassicCard,
        {
          title: "Tổng Giờ Công",
          value: `${(statistics?.totalWorkHours || 0).toFixed(1)}h`,
          icon: Clock,
          color: "blue",
          description: "Tính trong kỳ"
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 234,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        ClassicCard,
        {
          title: "TB Giờ/Ngày",
          value: `${(statistics?.averageWorkHours || 0).toFixed(1)}h`,
          icon: TrendingUp,
          color: "purple",
          description: "Bình quân mỗi ngày"
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 242,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 217,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      DailyStatsCard,
      {
        attendances,
        users,
        selectedDate: selectedDate || void 0
      },
      void 0,
      false,
      {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 253,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { className: "border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => setActiveTab("overview"),
          className: `px-4 py-3 text-sm font-medium transition-colors ${activeTab === "overview" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`,
          children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV(Calendar, { className: "h-4 w-4" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 270,
              columnNumber: 29
            }, this),
            "Tổng quan"
          ] }, void 0, true, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 269,
            columnNumber: 25
          }, this)
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 262,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => setActiveTab("approvals"),
          className: `px-4 py-3 text-sm font-medium transition-colors ${activeTab === "approvals" ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`,
          children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "h-4 w-4" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 283,
              columnNumber: 29
            }, this),
            "Cần duyệt"
          ] }, void 0, true, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 282,
            columnNumber: 25
          }, this)
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 275,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, true, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 261,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 260,
      columnNumber: 13
    }, this),
    activeTab === "overview" && /* @__PURE__ */ jsxDEV("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-6 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800", children: [
          /* @__PURE__ */ jsxDEV("label", { htmlFor: "month", className: "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300", children: "📅 Chọn tháng xem chấm công" }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 297,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ jsxDEV(
            MonthPicker,
            {
              value: selectedMonth,
              onChange: setSelectedMonth
            },
            void 0,
            false,
            {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 300,
              columnNumber: 29
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: "Dữ liệu chấm công sẽ được hiển thị theo tháng được chọn." }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 304,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 296,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800", children: [
          /* @__PURE__ */ jsxDEV("label", { className: "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300", children: "👤 Chọn nhân viên" }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 311,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ jsxDEV(Popover, { open: openUserCombobox, onOpenChange: setOpenUserCombobox, children: [
            /* @__PURE__ */ jsxDEV(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(
              "button",
              {
                role: "combobox",
                "aria-expanded": openUserCombobox,
                className: "mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "truncate", children: selectedUserId === "me" ? "Của tôi" : selectedUserId === "all" ? "Tất cả nhân viên" : users.find((user) => user.id === selectedUserId)?.fullName || "Chọn nhân viên..." }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 321,
                    columnNumber: 41
                  }, this),
                  /* @__PURE__ */ jsxDEV(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 text-gray-400" }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 328,
                    columnNumber: 41
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                lineNumber: 316,
                columnNumber: 37
              },
              this
            ) }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 315,
              columnNumber: 33
            }, this),
            /* @__PURE__ */ jsxDEV(PopoverContent, { className: "w-full min-w-[300px] p-0", align: "start", children: /* @__PURE__ */ jsxDEV(Command, { children: [
              /* @__PURE__ */ jsxDEV(CommandInput, { placeholder: "Gõ tên hoặc mã nhân viên..." }, void 0, false, {
                fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                lineNumber: 333,
                columnNumber: 41
              }, this),
              /* @__PURE__ */ jsxDEV(CommandList, { children: [
                /* @__PURE__ */ jsxDEV(CommandEmpty, { children: "Không tìm thấy nhân viên." }, void 0, false, {
                  fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                  lineNumber: 335,
                  columnNumber: 45
                }, this),
                /* @__PURE__ */ jsxDEV(CommandGroup, { children: [
                  /* @__PURE__ */ jsxDEV(
                    CommandItem,
                    {
                      value: "Của tôi",
                      onSelect: () => {
                        setSelectedUserId("me");
                        setOpenUserCombobox(false);
                      },
                      children: [
                        /* @__PURE__ */ jsxDEV(
                          Check,
                          {
                            className: cn(
                              "mr-2 h-4 w-4",
                              selectedUserId === "me" ? "opacity-100" : "opacity-0"
                            )
                          },
                          void 0,
                          false,
                          {
                            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                            lineNumber: 344,
                            columnNumber: 53
                          },
                          this
                        ),
                        "Của tôi"
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                      lineNumber: 337,
                      columnNumber: 49
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(
                    CommandItem,
                    {
                      value: "Tất cả nhân viên",
                      onSelect: () => {
                        setSelectedUserId("all");
                        setOpenUserCombobox(false);
                      },
                      children: [
                        /* @__PURE__ */ jsxDEV(
                          Check,
                          {
                            className: cn(
                              "mr-2 h-4 w-4",
                              selectedUserId === "all" ? "opacity-100" : "opacity-0"
                            )
                          },
                          void 0,
                          false,
                          {
                            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                            lineNumber: 359,
                            columnNumber: 53
                          },
                          this
                        ),
                        "Tất cả nhân viên"
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                      lineNumber: 352,
                      columnNumber: 49
                    },
                    this
                  ),
                  users.map(
                    (user) => /* @__PURE__ */ jsxDEV(
                      CommandItem,
                      {
                        value: user.fullName + " " + user.employeeCode,
                        onSelect: () => {
                          setSelectedUserId(user.id);
                          setOpenUserCombobox(false);
                        },
                        children: [
                          /* @__PURE__ */ jsxDEV(
                            Check,
                            {
                              className: cn(
                                "mr-2 h-4 w-4",
                                selectedUserId === user.id ? "opacity-100" : "opacity-0"
                              )
                            },
                            void 0,
                            false,
                            {
                              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                              lineNumber: 376,
                              columnNumber: 57
                            },
                            this
                          ),
                          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col", children: [
                            /* @__PURE__ */ jsxDEV("span", { children: user.fullName }, void 0, false, {
                              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                              lineNumber: 383,
                              columnNumber: 61
                            }, this),
                            /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-gray-500", children: user.employeeCode }, void 0, false, {
                              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                              lineNumber: 384,
                              columnNumber: 61
                            }, this)
                          ] }, void 0, true, {
                            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                            lineNumber: 382,
                            columnNumber: 57
                          }, this)
                        ]
                      },
                      user.id,
                      true,
                      {
                        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                        lineNumber: 368,
                        columnNumber: 23
                      },
                      this
                    )
                  )
                ] }, void 0, true, {
                  fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                  lineNumber: 336,
                  columnNumber: 45
                }, this)
              ] }, void 0, true, {
                fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                lineNumber: 334,
                columnNumber: 41
              }, this)
            ] }, void 0, true, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 332,
              columnNumber: 37
            }, this) }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 331,
              columnNumber: 33
            }, this)
          ] }, void 0, true, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 314,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-xs text-gray-500 dark:text-gray-400", children: "Lọc danh sách công theo từng cá nhân." }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 393,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 310,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 294,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV(
        AttendanceToolbar,
        {
          attendances,
          users: displayedUsers,
          month: selectedMonth
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 400,
          columnNumber: 21
        },
        this
      ),
      viewMode === "matrix" && /* @__PURE__ */ jsxDEV(
        AttendanceMonthlyMatrix,
        {
          attendances,
          users: displayedUsers,
          month: selectedMonth,
          onCellClick: (userId, date) => {
            setSelectedDate(date);
            setViewMode("list");
          }
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 408,
          columnNumber: 9
        },
        this
      ),
      viewMode === "calendar" && /* @__PURE__ */ jsxDEV(
        AttendanceCalendar,
        {
          attendances,
          month: selectedMonth,
          onMonthChange: setSelectedMonth,
          onDateClick: handleDateClick
        },
        void 0,
        false,
        {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 421,
          columnNumber: 9
        },
        this
      ),
      viewMode === "list" && /* @__PURE__ */ jsxDEV("div", { className: "rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900", children: [
        selectedDate && /* @__PURE__ */ jsxDEV("div", { className: "border-b border-gray-200 p-4 dark:border-gray-700", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxDEV("span", { children: [
            "Hiển thị dữ liệu cho ngày:",
            " ",
            /* @__PURE__ */ jsxDEV("span", { className: "font-medium text-gray-900 dark:text-white", children: new Date(selectedDate).toLocaleDateString("vi-VN") }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 436,
              columnNumber: 45
            }, this)
          ] }, void 0, true, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 435,
            columnNumber: 41
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setSelectedDate(null),
              className: "text-blue-600 hover:text-blue-700 dark:text-blue-400",
              children: "Xem tất cả"
            },
            void 0,
            false,
            {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 440,
              columnNumber: 41
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("span", { className: "text-gray-300", children: "|" }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 446,
            columnNumber: 41
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => {
                setSelectedDate(null);
                setViewMode("matrix");
              },
              className: "text-gray-600 hover:text-gray-900 flex items-center gap-1 dark:text-gray-400 dark:hover:text-white",
              children: [
                /* @__PURE__ */ jsxDEV("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxDEV("path", { d: "m15 18-6-6 6-6" }, void 0, false, {
                  fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                  lineNumber: 454,
                  columnNumber: 223
                }, this) }, void 0, false, {
                  fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                  lineNumber: 454,
                  columnNumber: 45
                }, this),
                "Quay lại Bảng"
              ]
            },
            void 0,
            true,
            {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 447,
              columnNumber: 41
            },
            this
          )
        ] }, void 0, true, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 434,
          columnNumber: 37
        }, this) }, void 0, false, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 433,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxDEV("thead", { className: "bg-gray-50 dark:bg-gray-800", children: /* @__PURE__ */ jsxDEV("tr", { children: [
            /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Ngày" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 465,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Giờ vào" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 468,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Giờ ra" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 471,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Giờ công" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 474,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Trạng thái" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 477,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Loại nghỉ" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 480,
              columnNumber: 45
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400", children: "Ghi chú" }, void 0, false, {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 483,
              columnNumber: 45
            }, this)
          ] }, void 0, true, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 464,
            columnNumber: 41
          }, this) }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 463,
            columnNumber: 37
          }, this),
          /* @__PURE__ */ jsxDEV("tbody", { className: "divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900", children: filteredAttendances.length === 0 ? /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV(
            "td",
            {
              colSpan: 7,
              className: "px-6 py-12 text-center text-gray-500 dark:text-gray-400",
              children: "Không có dữ liệu chấm công"
            },
            void 0,
            false,
            {
              fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
              lineNumber: 491,
              columnNumber: 49
            },
            this
          ) }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 490,
            columnNumber: 17
          }, this) : filteredAttendances.map(
            (attendance) => /* @__PURE__ */ jsxDEV(
              "tr",
              {
                className: "hover:bg-gray-50 dark:hover:bg-gray-800",
                children: [
                  /* @__PURE__ */ jsxDEV("td", { className: "whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white", children: new Date(attendance.date).toLocaleDateString("vi-VN") }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 504,
                    columnNumber: 53
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "whitespace-nowrap px-6 py-4 text-sm", children: /* @__PURE__ */ jsxDEV(TimeDisplay, { time: attendance.checkInTime }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 508,
                    columnNumber: 57
                  }, this) }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 507,
                    columnNumber: 53
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "whitespace-nowrap px-6 py-4 text-sm", children: /* @__PURE__ */ jsxDEV(TimeDisplay, { time: attendance.checkOutTime }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 511,
                    columnNumber: 57
                  }, this) }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 510,
                    columnNumber: 53
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "whitespace-nowrap px-6 py-4 text-sm", children: /* @__PURE__ */ jsxDEV(WorkHoursDisplay, { hours: attendance.workHours }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 514,
                    columnNumber: 57
                  }, this) }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 513,
                    columnNumber: 53
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "whitespace-nowrap px-6 py-4 text-sm", children: /* @__PURE__ */ jsxDEV(AttendanceStatusBadge, { status: attendance.status }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 517,
                    columnNumber: 57
                  }, this) }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 516,
                    columnNumber: 53
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "whitespace-nowrap px-6 py-4 text-sm", children: /* @__PURE__ */ jsxDEV(LeaveTypeDisplay, { leaveType: attendance.leaveType }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 520,
                    columnNumber: 57
                  }, this) }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 519,
                    columnNumber: 53
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4 text-sm text-gray-600 dark:text-gray-400", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-2", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "truncate max-w-[150px] block", title: attendance.notes || "", children: attendance.notes || "—" }, void 0, false, {
                      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                      lineNumber: 524,
                      columnNumber: 61
                    }, this),
                    authUser?.role?.roleKey === "admin" && /* @__PURE__ */ jsxDEV(
                      "button",
                      {
                        onClick: () => setEditDialogRecord(attendance),
                        className: "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                        title: "Sửa chấm công",
                        children: /* @__PURE__ */ jsxDEV(Edit2, { className: "h-4 w-4" }, void 0, false, {
                          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                          lineNumber: 534,
                          columnNumber: 69
                        }, this)
                      },
                      void 0,
                      false,
                      {
                        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                        lineNumber: 529,
                        columnNumber: 23
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 523,
                    columnNumber: 57
                  }, this) }, void 0, false, {
                    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                    lineNumber: 522,
                    columnNumber: 53
                  }, this)
                ]
              },
              attendance.id,
              true,
              {
                fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
                lineNumber: 500,
                columnNumber: 17
              },
              this
            )
          ) }, void 0, false, {
            fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
            lineNumber: 488,
            columnNumber: 37
          }, this)
        ] }, void 0, true, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 462,
          columnNumber: 33
        }, this) }, void 0, false, {
          fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
          lineNumber: 461,
          columnNumber: 29
        }, this)
      ] }, void 0, true, {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 431,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 292,
      columnNumber: 7
    }, this),
    activeTab === "approvals" && /* @__PURE__ */ jsxDEV(
      AttendanceApprovalsTab,
      {
        attendances: attendanceList,
        users,
        isLoading: loading,
        onApprove: handleApproveLeave,
        onReject: handleRejectLeave
      },
      void 0,
      false,
      {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 552,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(GenerateQRDialog, { isOpen: showQRDialog, onClose: () => setShowQRDialog(false) }, void 0, false, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 562,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(RequestLeaveDialog, { isOpen: showRequestLeave, onClose: () => setShowRequestLeave(false) }, void 0, false, {
      fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
      lineNumber: 564,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV(
      AttendanceEditDialog,
      {
        isOpen: !!editDialogRecord,
        onClose: () => setEditDialogRecord(null),
        attendance: editDialogRecord,
        onSuccess: loadData
      },
      void 0,
      false,
      {
        fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
        lineNumber: 567,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx",
    lineNumber: 151,
    columnNumber: 5
  }, this);
}
_s(AttendancePage, "nVZB6bK22BogU0LUbWT8AGlg9Is=", false, function() {
  return [useDispatch, useSelector, useSelector, useSelector];
});
_c2 = AttendancePage;
var _c, _c2;
$RefreshReg$(_c, "ClassicCard");
$RefreshReg$(_c2, "AttendancePage");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) {
  return RefreshRuntime.register(type, "D:/a_themduan/chuyendoireact/LAB-NamViet-Client-V1/nam-viet-client/src/views/admin/attendance/AttendancePage.jsx " + id);
}
function $RefreshSig$() {
  return RefreshRuntime.createSignatureFunctionForTransform();
}

//# sourceMappingURL=data:application/json;base64,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VUFDakJ6RCxhQWU2Q0MsYUFDNUNBLGFBQ0RBLFdBQVc7QUFBQTtBQUFBLE1BbEJSd0Q7QUFBYyxJQUFBRCxJQUFBcUY7QUFBQSxhQUFBckYsSUFBQTtBQUFBLGFBQUFxRixLQUFBIiwibmFtZXMiOlsiUmVhY3QiLCJ1c2VTdGF0ZSIsInVzZU1lbW8iLCJ1c2VFZmZlY3QiLCJ1c2VDYWxsYmFjayIsInVzZURpc3BhdGNoIiwidXNlU2VsZWN0b3IiLCJnZXRNeUF0dGVuZGFuY2UiLCJnZXRBdHRlbmRhbmNlTGlzdCIsImdldEF0dGVuZGFuY2VTdGF0aXN0aWNzIiwiYXBwcm92ZUxlYXZlIiwicmVqZWN0TGVhdmUiLCJnZXRVc2VycyIsIkF0dGVuZGFuY2VDYWxlbmRhciIsIkF0dGVuZGFuY2VNb250aGx5TWF0cml4IiwiRGFpbHlTdGF0c0NhcmQiLCJBdHRlbmRhbmNlQXBwcm92YWxzVGFiIiwiQXR0ZW5kYW5jZVRvb2xiYXIiLCJHZW5lcmF0ZVFSRGlhbG9nIiwiUmVxdWVzdExlYXZlRGlhbG9nIiwiQXR0ZW5kYW5jZUVkaXREaWFsb2ciLCJBdHRlbmRhbmNlU3RhdHVzQmFkZ2UiLCJUaW1lRGlzcGxheSIsIldvcmtIb3Vyc0Rpc3BsYXkiLCJMZWF2ZVR5cGVEaXNwbGF5IiwiTW9udGhQaWNrZXIiLCJQb3BvdmVyIiwiUG9wb3ZlckNvbnRlbnQiLCJQb3BvdmVyVHJpZ2dlciIsIkNvbW1hbmQiLCJDb21tYW5kRW1wdHkiLCJDb21tYW5kR3JvdXAiLCJDb21tYW5kSW5wdXQiLCJDb21tYW5kSXRlbSIsIkNvbW1hbmRMaXN0IiwiY24iLCJDYWxlbmRhciIsIkxpc3QiLCJDbG9jayIsIlRyZW5kaW5nVXAiLCJVc2VyQ2hlY2siLCJVc2VyWCIsIkdyaWQzeDMiLCJDaGVja0NpcmNsZTIiLCJRckNvZGUiLCJFZGl0MiIsIkNoZXZyb25zVXBEb3duIiwiQ2hlY2siLCJDbGFzc2ljQ2FyZCIsInRpdGxlIiwidmFsdWUiLCJpY29uIiwiY29sb3IiLCJkZXNjcmlwdGlvbiIsIkljb24iLCJjb2xvckNsYXNzZXMiLCJncmVlbiIsInJlZCIsImJsdWUiLCJwdXJwbGUiLCJpY29uQ2xhc3MiLCJfYyIsIkF0dGVuZGFuY2VQYWdlIiwiX3MiLCJkaXNwYXRjaCIsInZpZXdNb2RlIiwic2V0Vmlld01vZGUiLCJhY3RpdmVUYWIiLCJzZXRBY3RpdmVUYWIiLCJzZWxlY3RlZE1vbnRoIiwic2V0U2VsZWN0ZWRNb250aCIsIm5vdyIsIkRhdGUiLCJnZXRGdWxsWWVhciIsIlN0cmluZyIsImdldE1vbnRoIiwicGFkU3RhcnQiLCJzZWxlY3RlZFVzZXJJZCIsInNldFNlbGVjdGVkVXNlcklkIiwic2VsZWN0ZWREYXRlIiwic2V0U2VsZWN0ZWREYXRlIiwic2hvd1FSRGlhbG9nIiwic2V0U2hvd1FSRGlhbG9nIiwic2hvd1JlcXVlc3RMZWF2ZSIsInNldFNob3dSZXF1ZXN0TGVhdmUiLCJlZGl0RGlhbG9nUmVjb3JkIiwic2V0RWRpdERpYWxvZ1JlY29yZCIsIm9wZW5Vc2VyQ29tYm9ib3giLCJzZXRPcGVuVXNlckNvbWJvYm94IiwiYXR0ZW5kYW5jZUxpc3QiLCJteUF0dGVuZGFuY2UiLCJzdGF0aXN0aWNzIiwibG9hZGluZyIsInN0YXRlIiwiYXR0ZW5kYW5jZSIsInVzZXJzIiwidXNlciIsImF1dGhVc2VyIiwiYXV0aCIsImF1dGhVc2VyV2l0aFJvbGVIYXNQZXJtaXNzaW9ucyIsImlzTXlWaWV3IiwiaXNBbGxWaWV3IiwibW9udGhGb3JtYXR0ZWQiLCJyZXBsYWNlIiwiZGlzcGxheWVkVXNlcnMiLCJpZCIsImZ1bGxOYW1lIiwiZmlsdGVyIiwidSIsInN0YXR1cyIsImxvYWREYXRhIiwibW9udGgiLCJ1c2VySWQiLCJ1bmRlZmluZWQiLCJyYXdBdHRlbmRhbmNlcyIsImF0dGVuZGFuY2VzIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsdGVyZWRBdHRlbmRhbmNlcyIsImF0dCIsImRhdGUiLCJkYXRlU3RyIiwidG9JU09TdHJpbmciLCJzcGxpdCIsImhhbmRsZURhdGVDbGljayIsImhhbmRsZUFwcHJvdmVMZWF2ZSIsIndpbmRvdyIsImNvbmZpcm0iLCJoYW5kbGVSZWplY3RMZWF2ZSIsInByZXNlbnREYXlzIiwiYWJzZW50RGF5cyIsInRvdGFsV29ya0hvdXJzIiwidG9GaXhlZCIsImF2ZXJhZ2VXb3JrSG91cnMiLCJmaW5kIiwibWFwIiwiZW1wbG95ZWVDb2RlIiwidG9Mb2NhbGVEYXRlU3RyaW5nIiwibGVuZ3RoIiwiY2hlY2tJblRpbWUiLCJjaGVja091dFRpbWUiLCJ3b3JrSG91cnMiLCJsZWF2ZVR5cGUiLCJub3RlcyIsInJvbGUiLCJyb2xlS2V5IiwiX2MyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIkF0dGVuZGFuY2VQYWdlLmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZU1lbW8sIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCdcclxuaW1wb3J0IHsgdXNlRGlzcGF0Y2gsIHVzZVNlbGVjdG9yIH0gZnJvbSAncmVhY3QtcmVkdXgnXHJcbmltcG9ydCB7IGdldE15QXR0ZW5kYW5jZSwgZ2V0QXR0ZW5kYW5jZUxpc3QsIGdldEF0dGVuZGFuY2VTdGF0aXN0aWNzLCBhcHByb3ZlTGVhdmUsIHJlamVjdExlYXZlIH0gZnJvbSAnQC9zdG9yZXMvQXR0ZW5kYW5jZVNsaWNlJ1xyXG5pbXBvcnQgeyBnZXRVc2VycyB9IGZyb20gJ0Avc3RvcmVzL1VzZXJTbGljZSdcclxuaW1wb3J0IEF0dGVuZGFuY2VDYWxlbmRhciBmcm9tICcuL2NvbXBvbmVudHMvQXR0ZW5kYW5jZUNhbGVuZGFyJ1xyXG5pbXBvcnQgQXR0ZW5kYW5jZU1vbnRobHlNYXRyaXggZnJvbSAnLi9jb21wb25lbnRzL0F0dGVuZGFuY2VNb250aGx5TWF0cml4J1xyXG5pbXBvcnQgRGFpbHlTdGF0c0NhcmQgZnJvbSAnLi9jb21wb25lbnRzL0RhaWx5U3RhdHNDYXJkJ1xyXG5pbXBvcnQgQXR0ZW5kYW5jZUFwcHJvdmFsc1RhYiBmcm9tICcuL2NvbXBvbmVudHMvQXR0ZW5kYW5jZUFwcHJvdmFsc1RhYidcclxuaW1wb3J0IEF0dGVuZGFuY2VUb29sYmFyIGZyb20gJy4vY29tcG9uZW50cy9BdHRlbmRhbmNlVG9vbGJhcidcclxuaW1wb3J0IEdlbmVyYXRlUVJEaWFsb2cgZnJvbSAnLi9jb21wb25lbnRzL0dlbmVyYXRlUVJEaWFsb2cnXHJcbmltcG9ydCBSZXF1ZXN0TGVhdmVEaWFsb2cgZnJvbSAnLi9jb21wb25lbnRzL1JlcXVlc3RMZWF2ZURpYWxvZydcclxuaW1wb3J0IEF0dGVuZGFuY2VFZGl0RGlhbG9nIGZyb20gJy4vY29tcG9uZW50cy9BdHRlbmRhbmNlRWRpdERpYWxvZydcclxuaW1wb3J0IEF0dGVuZGFuY2VTdGF0dXNCYWRnZSwge1xyXG4gICAgVGltZURpc3BsYXksXHJcbiAgICBXb3JrSG91cnNEaXNwbGF5LFxyXG4gICAgTGVhdmVUeXBlRGlzcGxheSxcclxufSBmcm9tICcuL2NvbXBvbmVudHMvQXR0ZW5kYW5jZVN0YXR1cydcclxuaW1wb3J0IE1vbnRoUGlja2VyIGZyb20gJy4vY29tcG9uZW50cy9Nb250aFBpY2tlcidcclxuaW1wb3J0IHsgUG9wb3ZlciwgUG9wb3ZlckNvbnRlbnQsIFBvcG92ZXJUcmlnZ2VyIH0gZnJvbSAnQC9jb21wb25lbnRzL3VpL3BvcG92ZXInXHJcbmltcG9ydCB7IENvbW1hbmQsIENvbW1hbmRFbXB0eSwgQ29tbWFuZEdyb3VwLCBDb21tYW5kSW5wdXQsIENvbW1hbmRJdGVtLCBDb21tYW5kTGlzdCB9IGZyb20gJ0AvY29tcG9uZW50cy91aS9jb21tYW5kJ1xyXG5pbXBvcnQgeyBjbiB9IGZyb20gJ0AvbGliL3V0aWxzJ1xyXG5pbXBvcnQge1xyXG4gICAgQ2FsZW5kYXIsXHJcbiAgICBMaXN0LFxyXG4gICAgQ2xvY2ssXHJcbiAgICBUcmVuZGluZ1VwLFxyXG4gICAgVXNlckNoZWNrLFxyXG4gICAgVXNlclgsXHJcbiAgICBHcmlkM3gzLFxyXG4gICAgQ2hlY2tDaXJjbGUyLFxyXG4gICAgUXJDb2RlLFxyXG4gICAgRWRpdDIsXHJcbiAgICBDaGV2cm9uc1VwRG93bixcclxuICAgIENoZWNrXHJcbn0gZnJvbSAnbHVjaWRlLXJlYWN0J1xyXG5cclxuLy8gU2ltcGxlIENsYXNzaWNDYXJkIGNvbXBvbmVudCBzaW5jZSB3ZSBjb3VsZG4ndCBmaW5kIHRoZSBleGFjdCBvbmUgZnJvbSBOZXh0LmpzXHJcbmZ1bmN0aW9uIENsYXNzaWNDYXJkKHsgdGl0bGUsIHZhbHVlLCBpY29uLCBjb2xvciwgZGVzY3JpcHRpb24gfSkge1xyXG4gICAgY29uc3QgSWNvbiA9IGljb25cclxuICAgIGNvbnN0IGNvbG9yQ2xhc3NlcyA9IHtcclxuICAgICAgICBncmVlbjogJ3RleHQtZ3JlZW4tNjAwIGJnLWdyZWVuLTEwMCBkYXJrOnRleHQtZ3JlZW4tNDAwIGRhcms6YmctZ3JlZW4tOTAwLzMwJyxcclxuICAgICAgICByZWQ6ICd0ZXh0LXJlZC02MDAgYmctcmVkLTEwMCBkYXJrOnRleHQtcmVkLTQwMCBkYXJrOmJnLXJlZC05MDAvMzAnLFxyXG4gICAgICAgIGJsdWU6ICd0ZXh0LWJsdWUtNjAwIGJnLWJsdWUtMTAwIGRhcms6dGV4dC1ibHVlLTQwMCBkYXJrOmJnLWJsdWUtOTAwLzMwJyxcclxuICAgICAgICBwdXJwbGU6ICd0ZXh0LXB1cnBsZS02MDAgYmctcHVycGxlLTEwMCBkYXJrOnRleHQtcHVycGxlLTQwMCBkYXJrOmJnLXB1cnBsZS05MDAvMzAnLFxyXG4gICAgfVxyXG4gICAgY29uc3QgaWNvbkNsYXNzID0gY29sb3JDbGFzc2VzW2NvbG9yXSB8fCBjb2xvckNsYXNzZXMuYmx1ZVxyXG5cclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgYmctd2hpdGUgcC02IHNoYWRvdy1zbSBkYXJrOmJvcmRlci1ncmF5LTcwMCBkYXJrOmJnLWdyYXktODAwXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgZmxleCBoLTEyIHctMTIgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHJvdW5kZWQtbGcgJHtpY29uQ2xhc3N9YH0+XHJcbiAgICAgICAgICAgICAgICAgICAgPEljb24gY2xhc3NOYW1lPVwiaC02IHctNlwiIC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPnt0aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCI+e3ZhbHVlfTwvcD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAge2Rlc2NyaXB0aW9uICYmIChcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNCB0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+e2Rlc2NyaXB0aW9ufTwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgKVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBdHRlbmRhbmNlUGFnZSgpIHtcclxuICAgIGNvbnN0IGRpc3BhdGNoID0gdXNlRGlzcGF0Y2goKVxyXG5cclxuICAgIGNvbnN0IFt2aWV3TW9kZSwgc2V0Vmlld01vZGVdID0gdXNlU3RhdGUoJ21hdHJpeCcpXHJcbiAgICBjb25zdCBbYWN0aXZlVGFiLCBzZXRBY3RpdmVUYWJdID0gdXNlU3RhdGUoJ292ZXJ2aWV3JylcclxuICAgIGNvbnN0IFtzZWxlY3RlZE1vbnRoLCBzZXRTZWxlY3RlZE1vbnRoXSA9IHVzZVN0YXRlKCgpID0+IHtcclxuICAgICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpXHJcbiAgICAgICAgcmV0dXJuIGAke25vdy5nZXRGdWxsWWVhcigpfS0ke1N0cmluZyhub3cuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsICcwJyl9YFxyXG4gICAgfSlcclxuICAgIGNvbnN0IFtzZWxlY3RlZFVzZXJJZCwgc2V0U2VsZWN0ZWRVc2VySWRdID0gdXNlU3RhdGUoJ21lJylcclxuICAgIGNvbnN0IFtzZWxlY3RlZERhdGUsIHNldFNlbGVjdGVkRGF0ZV0gPSB1c2VTdGF0ZShudWxsKVxyXG4gICAgY29uc3QgW3Nob3dRUkRpYWxvZywgc2V0U2hvd1FSRGlhbG9nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gICAgY29uc3QgW3Nob3dSZXF1ZXN0TGVhdmUsIHNldFNob3dSZXF1ZXN0TGVhdmVdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgICBjb25zdCBbZWRpdERpYWxvZ1JlY29yZCwgc2V0RWRpdERpYWxvZ1JlY29yZF0gPSB1c2VTdGF0ZShudWxsKVxyXG4gICAgY29uc3QgW29wZW5Vc2VyQ29tYm9ib3gsIHNldE9wZW5Vc2VyQ29tYm9ib3hdID0gdXNlU3RhdGUoZmFsc2UpXHJcblxyXG4gICAgY29uc3QgeyBhdHRlbmRhbmNlTGlzdCwgbXlBdHRlbmRhbmNlLCBzdGF0aXN0aWNzLCBsb2FkaW5nIH0gPSB1c2VTZWxlY3Rvcigoc3RhdGUpID0+IHN0YXRlLmF0dGVuZGFuY2UpXHJcbiAgICBjb25zdCB7IHVzZXJzIH0gPSB1c2VTZWxlY3Rvcigoc3RhdGUpID0+IHN0YXRlLnVzZXIpXHJcbiAgICBjb25zdCBhdXRoVXNlciA9IHVzZVNlbGVjdG9yKChzdGF0ZSkgPT4gc3RhdGUuYXV0aD8uYXV0aFVzZXJXaXRoUm9sZUhhc1Blcm1pc3Npb25zKVxyXG5cclxuICAgIGNvbnN0IGlzTXlWaWV3ID0gc2VsZWN0ZWRVc2VySWQgPT09ICdtZSdcclxuICAgIGNvbnN0IGlzQWxsVmlldyA9IHNlbGVjdGVkVXNlcklkID09PSAnYWxsJ1xyXG4gICAgY29uc3QgbW9udGhGb3JtYXR0ZWQgPSBzZWxlY3RlZE1vbnRoLnJlcGxhY2UoJy0nLCAnJykgLy8gWVlZWS1NTSAtPiBZWVlZTU1cclxuXHJcbiAgICBjb25zdCBkaXNwbGF5ZWRVc2VycyA9IHVzZU1lbW8oKCkgPT4ge1xyXG4gICAgICAgIGlmIChpc015VmlldykgcmV0dXJuIGF1dGhVc2VyID8gW2F1dGhVc2VyXSA6IFt7IGlkOiAwLCBmdWxsTmFtZTogJ0Phu6dhIHTDtGknIH1dXHJcbiAgICAgICAgaWYgKGlzQWxsVmlldykgcmV0dXJuIHVzZXJzXHJcbiAgICAgICAgcmV0dXJuIHVzZXJzLmZpbHRlcih1ID0+IHUuaWQgPT09IHNlbGVjdGVkVXNlcklkKVxyXG4gICAgfSwgW2lzTXlWaWV3LCBpc0FsbFZpZXcsIHVzZXJzLCBhdXRoVXNlciwgc2VsZWN0ZWRVc2VySWRdKVxyXG5cclxuICAgIC8vIEluaXRpYWwgZmV0Y2hcclxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgZGlzcGF0Y2goZ2V0VXNlcnMoeyBzdGF0dXM6ICdhY3RpdmUnIH0pKVxyXG4gICAgfSwgW2Rpc3BhdGNoXSlcclxuXHJcbiAgICAvLyBGZXRjaGluZyBkYXRhIGxvZ2ljIHdyYXBwZWQgaW4gdXNlQ2FsbGJhY2sgc28gd2UgY2FuIHRyaWdnZXIgaXQgbWFudWFsbHlcclxuICAgIGNvbnN0IGxvYWREYXRhID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgICAgIGlmIChpc015Vmlldykge1xyXG4gICAgICAgICAgICBkaXNwYXRjaChnZXRNeUF0dGVuZGFuY2UoeyBtb250aDogbW9udGhGb3JtYXR0ZWQgfSkpXHJcbiAgICAgICAgfSBlbHNlIGlmIChpc0FsbFZpZXcpIHtcclxuICAgICAgICAgICAgZGlzcGF0Y2goZ2V0QXR0ZW5kYW5jZUxpc3QoeyBtb250aDogbW9udGhGb3JtYXR0ZWQgfSkpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGlzcGF0Y2goZ2V0QXR0ZW5kYW5jZUxpc3QoeyB1c2VySWQ6IHNlbGVjdGVkVXNlcklkLCBtb250aDogbW9udGhGb3JtYXR0ZWQgfSkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGRpc3BhdGNoKGdldEF0dGVuZGFuY2VTdGF0aXN0aWNzKHsgXHJcbiAgICAgICAgICAgIG1vbnRoOiBtb250aEZvcm1hdHRlZCxcclxuICAgICAgICAgICAgdXNlcklkOiAoaXNNeVZpZXcgfHwgaXNBbGxWaWV3KSA/IHVuZGVmaW5lZCA6IHNlbGVjdGVkVXNlcklkIFxyXG4gICAgICAgIH0pKVxyXG4gICAgfSwgW2Rpc3BhdGNoLCBpc015VmlldywgaXNBbGxWaWV3LCBtb250aEZvcm1hdHRlZCwgc2VsZWN0ZWRVc2VySWRdKVxyXG5cclxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAgICAgbG9hZERhdGEoKVxyXG4gICAgfSwgW2xvYWREYXRhXSlcclxuXHJcbiAgICBjb25zdCByYXdBdHRlbmRhbmNlcyA9IGlzTXlWaWV3ID8gbXlBdHRlbmRhbmNlIDogYXR0ZW5kYW5jZUxpc3RcclxuICAgIGNvbnN0IGF0dGVuZGFuY2VzID0gQXJyYXkuaXNBcnJheShyYXdBdHRlbmRhbmNlcykgPyByYXdBdHRlbmRhbmNlcyA6IFtdXHJcblxyXG4gICAgLy8gRmlsdGVyIGF0dGVuZGFuY2VzIGJ5IHNlbGVjdGVkIGRhdGUgaWYgaW4gbGlzdCB2aWV3XHJcbiAgICBjb25zdCBmaWx0ZXJlZEF0dGVuZGFuY2VzID0gdXNlTWVtbygoKSA9PiB7XHJcbiAgICAgICAgaWYgKCFzZWxlY3RlZERhdGUgfHwgdmlld01vZGUgIT09ICdsaXN0JykgcmV0dXJuIGF0dGVuZGFuY2VzXHJcbiAgICAgICAgcmV0dXJuIGF0dGVuZGFuY2VzLmZpbHRlcigoYXR0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghYXR0LmRhdGUpIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICBjb25zdCBkYXRlU3RyID0gbmV3IERhdGUoYXR0LmRhdGUpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXVxyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZVN0ciA9PT0gc2VsZWN0ZWREYXRlXHJcbiAgICAgICAgfSlcclxuICAgIH0sIFthdHRlbmRhbmNlcywgc2VsZWN0ZWREYXRlLCB2aWV3TW9kZV0pXHJcblxyXG4gICAgY29uc3QgaGFuZGxlRGF0ZUNsaWNrID0gKGRhdGUpID0+IHtcclxuICAgICAgICBzZXRTZWxlY3RlZERhdGUoZGF0ZSlcclxuICAgICAgICBzZXRWaWV3TW9kZSgnbGlzdCcpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFuZGxlQXBwcm92ZUxlYXZlID0gKGlkKSA9PiB7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5jb25maXJtKCdC4bqhbiBjw7MgY2jhuq9jIGNo4bqvbiBtdeG7kW4gZHV54buHdCB5w6p1IGPhuqd1IG7DoHk/JykpIHtcclxuICAgICAgICAgICAgZGlzcGF0Y2goYXBwcm92ZUxlYXZlKGlkKSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaGFuZGxlUmVqZWN0TGVhdmUgPSAoaWQpID0+IHtcclxuICAgICAgICBpZiAod2luZG93LmNvbmZpcm0oJ0LhuqFuIGPDsyBjaOG6r2MgY2jhuq9uIG114buRbiB04burIGNo4buRaSB5w6p1IGPhuqd1IG7DoHk/JykpIHtcclxuICAgICAgICAgICAgZGlzcGF0Y2gocmVqZWN0TGVhdmUoaWQpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS02IGgtZnVsbCBvdmVyZmxvdy15LWF1dG8gcGItMTAgcHItMlwiPlxyXG4gICAgICAgICAgICB7LyogSGVhZGVyICovfVxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCI+Q2jhuqVtIGPDtG5nPC9oMT5cclxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJtdC0xIHRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgUXXhuqNuIGzDvSB2w6AgdGhlbyBkw7VpIGNo4bqlbSBjw7RuZyBuaMOibiB2acOqblxyXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dSZXF1ZXN0TGVhdmUodHJ1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgYmctd2hpdGUgcHgtNCBweS0yIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBob3ZlcjpiZy1ncmF5LTUwIHRyYW5zaXRpb24tY29sb3JzIGRhcms6Ym9yZGVyLWdyYXktNzAwIGRhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMzAwIGRhcms6aG92ZXI6YmctZ3JheS03MDBcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPENhbGVuZGFyIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBYaW4gbmdo4buJIHBow6lwXHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiBRUiBDb2RlIEJ1dHRvbiAtIHVzdWFsbHkgZm9yIGFkbWlucy9tYW5hZ2VycyAqL31cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dRUkRpYWxvZyh0cnVlKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHJvdW5kZWQtbGcgYmctYmx1ZS02MDAgcHgtNCBweS0yIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC13aGl0ZSBob3ZlcjpiZy1ibHVlLTcwMCB0cmFuc2l0aW9uLWNvbG9yc1wiXHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8UXJDb2RlIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBU4bqhbyBRUlxyXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICB7LyogVmlldyBNb2RlIFRvZ2dsZSAqL31cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBwLTEgZGFyazpib3JkZXItZ3JheS03MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld01vZGUoJ21hdHJpeCcpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHJvdW5kZWQtbWQgcHgtMyBweS0yIHRleHQtc20gZm9udC1tZWRpdW0gdHJhbnNpdGlvbi1jb2xvcnMgJHt2aWV3TW9kZSA9PT0gJ21hdHJpeCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ibHVlLTYwMCB0ZXh0LXdoaXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3RleHQtZ3JheS03MDAgaG92ZXI6YmctZ3JheS0xMDAgZGFyazp0ZXh0LWdyYXktMzAwIGRhcms6aG92ZXI6YmctZ3JheS04MDAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxHcmlkM3gzIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQuG6o25nIGPDtG5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3TW9kZSgnY2FsZW5kYXInKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiByb3VuZGVkLW1kIHB4LTMgcHktMiB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYW5zaXRpb24tY29sb3JzICR7dmlld01vZGUgPT09ICdjYWxlbmRhcidcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdiZy1ibHVlLTYwMCB0ZXh0LXdoaXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3RleHQtZ3JheS03MDAgaG92ZXI6YmctZ3JheS0xMDAgZGFyazp0ZXh0LWdyYXktMzAwIGRhcms6aG92ZXI6YmctZ3JheS04MDAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDYWxlbmRhciBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEzhu4tjaFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld01vZGUoJ2xpc3QnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiByb3VuZGVkLW1kIHB4LTMgcHktMiB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYW5zaXRpb24tY29sb3JzICR7dmlld01vZGUgPT09ICdsaXN0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JnLWJsdWUtNjAwIHRleHQtd2hpdGUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAndGV4dC1ncmF5LTcwMCBob3ZlcjpiZy1ncmF5LTEwMCBkYXJrOnRleHQtZ3JheS0zMDAgZGFyazpob3ZlcjpiZy1ncmF5LTgwMCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPExpc3QgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBEYW5oIHPDoWNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIFN0YXRpc3RpY3MgQ2FyZHMgKi99XHJcbiAgICAgICAgICAgIHtzdGF0aXN0aWNzICYmIChcclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBnYXAtNCBzbTpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxDbGFzc2ljQ2FyZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIk5nw6B5IEPDsyBN4bq3dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtzdGF0aXN0aWNzPy5wcmVzZW50RGF5cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPXtVc2VyQ2hlY2t9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yPVwiZ3JlZW5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbj1cIk5ow6JuIHZpw6puIMSRw6MgY2jhuqVtIGPDtG5nXCJcclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8Q2xhc3NpY0NhcmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJOZ8OgeSBW4bqvbmdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17c3RhdGlzdGljcz8uYWJzZW50RGF5cyB8fCAwfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPXtVc2VyWH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I9XCJyZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbj1cIk5ow6JuIHZpw6puIHbhuq9uZyBt4bq3dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgPENsYXNzaWNDYXJkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiVOG7lW5nIEdp4budIEPDtG5nXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2AkeyhzdGF0aXN0aWNzPy50b3RhbFdvcmtIb3VycyB8fCAwKS50b0ZpeGVkKDEpfWhgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPXtDbG9ja31cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I9XCJibHVlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb249XCJUw61uaCB0cm9uZyBr4buzXCJcclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG5cclxuICAgICAgICAgICAgICAgICAgICA8Q2xhc3NpY0NhcmRcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJUQiBHaeG7nS9OZ8OgeVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtgJHsoc3RhdGlzdGljcz8uYXZlcmFnZVdvcmtIb3VycyB8fCAwKS50b0ZpeGVkKDEpfWhgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPXtUcmVuZGluZ1VwfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcj1cInB1cnBsZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiQsOsbmggcXXDom4gbeG7l2kgbmfDoHlcIlxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICAgIHsvKiBEYWlseSBTdGF0cyBDYXJkICovfVxyXG4gICAgICAgICAgICA8RGFpbHlTdGF0c0NhcmRcclxuICAgICAgICAgICAgICAgIGF0dGVuZGFuY2VzPXthdHRlbmRhbmNlc31cclxuICAgICAgICAgICAgICAgIHVzZXJzPXt1c2Vyc31cclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkRGF0ZT17c2VsZWN0ZWREYXRlIHx8IHVuZGVmaW5lZH1cclxuICAgICAgICAgICAgLz5cclxuXHJcbiAgICAgICAgICAgIHsvKiBUYWJzICovfVxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKCdvdmVydmlldycpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BweC00IHB5LTMgdGV4dC1zbSBmb250LW1lZGl1bSB0cmFuc2l0aW9uLWNvbG9ycyAke2FjdGl2ZVRhYiA9PT0gJ292ZXJ2aWV3J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYm9yZGVyLWItMiBib3JkZXItYmx1ZS02MDAgdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICd0ZXh0LWdyYXktNjAwIGhvdmVyOnRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktNDAwIGRhcms6aG92ZXI6dGV4dC13aGl0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1gfVxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENhbGVuZGFyIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVOG7lW5nIHF1YW5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlVGFiKCdhcHByb3ZhbHMnKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgcHgtNCBweS0zIHRleHQtc20gZm9udC1tZWRpdW0gdHJhbnNpdGlvbi1jb2xvcnMgJHthY3RpdmVUYWIgPT09ICdhcHByb3ZhbHMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdib3JkZXItYi0yIGJvcmRlci1ibHVlLTYwMCB0ZXh0LWJsdWUtNjAwIGRhcms6dGV4dC1ibHVlLTQwMCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJ3RleHQtZ3JheS02MDAgaG92ZXI6dGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtZ3JheS00MDAgZGFyazpob3Zlcjp0ZXh0LXdoaXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9XHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2tDaXJjbGUyIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ+G6p24gZHV54buHdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIHsvKiBUYWIgQ29udGVudCAqL31cclxuICAgICAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ292ZXJ2aWV3JyAmJiAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNlwiPlxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiBGaWx0ZXJzIC0gTW92ZWQgdG8gdmVydGljYWwgbGF5b3V0IHdpdGggYmV0dGVyIGNhcmQgc3R5bGluZyAqL31cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ2FwLTYgc206Z3JpZC1jb2xzLTJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgey8qIE1vbnRoIFNlbGVjdG9yIENhcmQgKi99XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGJnLXdoaXRlIHAtNSBzaGFkb3ctc20gdHJhbnNpdGlvbi1zaGFkb3cgaG92ZXI6c2hhZG93LW1kIGRhcms6Ym9yZGVyLWdyYXktNzAwIGRhcms6YmctZ3JheS04MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwibW9udGhcIiBjbGFzc05hbWU9XCJtYi0yIGJsb2NrIHRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTMwMFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIPCfk4UgQ2jhu41uIHRow6FuZyB4ZW0gY2jhuqVtIGPDtG5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE1vbnRoUGlja2VyIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZE1vbnRofVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTZWxlY3RlZE1vbnRofVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIm10LTIgdGV4dC14cyB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEThu68gbGnhu4d1IGNo4bqlbSBjw7RuZyBz4bq9IMSRxrDhu6NjIGhp4buDbiB0aOG7iyB0aGVvIHRow6FuZyDEkcaw4bujYyBjaOG7jW4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgey8qIFVzZXIgU2VsZWN0b3IgQ29tYm9ib3ggQ2FyZCAqL31cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZ3JheS0yMDAgYmctd2hpdGUgcC01IHNoYWRvdy1zbSB0cmFuc2l0aW9uLXNoYWRvdyBob3ZlcjpzaGFkb3ctbWQgZGFyazpib3JkZXItZ3JheS03MDAgZGFyazpiZy1ncmF5LTgwMFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIm1iLTIgYmxvY2sgdGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMzAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg8J+RpCBDaOG7jW4gbmjDom4gdmnDqm5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8UG9wb3ZlciBvcGVuPXtvcGVuVXNlckNvbWJvYm94fSBvbk9wZW5DaGFuZ2U9e3NldE9wZW5Vc2VyQ29tYm9ib3h9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxQb3BvdmVyVHJpZ2dlciBhc0NoaWxkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwiY29tYm9ib3hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17b3BlblVzZXJDb21ib2JveH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm10LTEgZmxleCB3LWZ1bGwgaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0zMDAgYmctZ3JheS01MCBweC00IHB5LTMgdGV4dC1iYXNlIGZvbnQtbWVkaXVtIGZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpiZy13aGl0ZSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAvMjAgZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpiZy1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgZGFyazpmb2N1czpiZy1ncmF5LTgwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRydW5jYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkVXNlcklkID09PSAnbWUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ0Phu6dhIHTDtGknXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogc2VsZWN0ZWRVc2VySWQgPT09ICdhbGwnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdU4bqldCBj4bqjIG5ow6JuIHZpw6puJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1c2Vycy5maW5kKCh1c2VyKSA9PiB1c2VyLmlkID09PSBzZWxlY3RlZFVzZXJJZCk/LmZ1bGxOYW1lIHx8ICdDaOG7jW4gbmjDom4gdmnDqm4uLi4nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENoZXZyb25zVXBEb3duIGNsYXNzTmFtZT1cIm1sLTIgaC00IHctNCBzaHJpbmstMCB0ZXh0LWdyYXktNDAwXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Qb3BvdmVyVHJpZ2dlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8UG9wb3ZlckNvbnRlbnQgY2xhc3NOYW1lPVwidy1mdWxsIG1pbi13LVszMDBweF0gcC0wXCIgYWxpZ249XCJzdGFydFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWFuZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tYW5kSW5wdXQgcGxhY2Vob2xkZXI9XCJHw7UgdMOqbiBob+G6t2MgbcOjIG5ow6JuIHZpw6puLi4uXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tYW5kTGlzdD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWFuZEVtcHR5Pktow7RuZyB0w6xtIHRo4bqleSBuaMOibiB2acOqbi48L0NvbW1hbmRFbXB0eT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWFuZEdyb3VwPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWFuZEl0ZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiQ+G7p2EgdMO0aVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdD17KCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkVXNlcklkKCdtZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0T3BlblVzZXJDb21ib2JveChmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVja1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtci0yIGgtNCB3LTQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFVzZXJJZCA9PT0gJ21lJyA/ICdvcGFjaXR5LTEwMCcgOiAnb3BhY2l0eS0wJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ+G7p2EgdMO0aVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0NvbW1hbmRJdGVtPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tbWFuZEl0ZW1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiVOG6pXQgY+G6oyBuaMOibiB2acOqblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblNlbGVjdD17KCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkVXNlcklkKCdhbGwnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE9wZW5Vc2VyQ29tYm9ib3goZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NuKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbXItMiBoLTQgdy00JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRVc2VySWQgPT09ICdhbGwnID8gJ29wYWNpdHktMTAwJyA6ICdvcGFjaXR5LTAnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBU4bqldCBj4bqjIG5ow6JuIHZpw6puXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQ29tbWFuZEl0ZW0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2Vycy5tYXAoKHVzZXIpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21tYW5kSXRlbVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17dXNlci5pZH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dXNlci5mdWxsTmFtZSArICcgJyArIHVzZXIuZW1wbG95ZWVDb2RlfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0PXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkVXNlcklkKHVzZXIuaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE9wZW5Vc2VyQ29tYm9ib3goZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtci0yIGgtNCB3LTQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRVc2VySWQgPT09IHVzZXIuaWQgPyAnb3BhY2l0eS0xMDAnIDogJ29wYWNpdHktMCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57dXNlci5mdWxsTmFtZX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1ncmF5LTUwMFwiPnt1c2VyLmVtcGxveWVlQ29kZX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0NvbW1hbmRJdGVtPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0NvbW1hbmRHcm91cD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQ29tbWFuZExpc3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQ29tbWFuZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1BvcG92ZXJDb250ZW50PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9Qb3BvdmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwibXQtMiB0ZXh0LXhzIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTOG7jWMgZGFuaCBzw6FjaCBjw7RuZyB0aGVvIHThu6tuZyBjw6EgbmjDom4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICB7LyogVG9vbGJhciAqL31cclxuICAgICAgICAgICAgICAgICAgICA8QXR0ZW5kYW5jZVRvb2xiYXJcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0ZW5kYW5jZXM9e2F0dGVuZGFuY2VzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2Vycz17ZGlzcGxheWVkVXNlcnN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoPXtzZWxlY3RlZE1vbnRofVxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiBNYXRyaXggVmlldyAqL31cclxuICAgICAgICAgICAgICAgICAgICB7dmlld01vZGUgPT09ICdtYXRyaXgnICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgPEF0dGVuZGFuY2VNb250aGx5TWF0cml4XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRlbmRhbmNlcz17YXR0ZW5kYW5jZXN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2Vycz17ZGlzcGxheWVkVXNlcnN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb250aD17c2VsZWN0ZWRNb250aH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2VsbENsaWNrPXsodXNlcklkLCBkYXRlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWREYXRlKGRhdGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0Vmlld01vZGUoJ2xpc3QnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB7LyogQ2FsZW5kYXIgVmlldyAqL31cclxuICAgICAgICAgICAgICAgICAgICB7dmlld01vZGUgPT09ICdjYWxlbmRhcicgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8QXR0ZW5kYW5jZUNhbGVuZGFyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRlbmRhbmNlcz17YXR0ZW5kYW5jZXN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb250aD17c2VsZWN0ZWRNb250aH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTW9udGhDaGFuZ2U9e3NldFNlbGVjdGVkTW9udGh9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkRhdGVDbGljaz17aGFuZGxlRGF0ZUNsaWNrfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiBMaXN0IFZpZXcgKi99XHJcbiAgICAgICAgICAgICAgICAgICAge3ZpZXdNb2RlID09PSAnbGlzdCcgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBiZy13aGl0ZSBkYXJrOmJvcmRlci1ncmF5LTcwMCBkYXJrOmJnLWdyYXktOTAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWREYXRlICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBwLTQgZGFyazpib3JkZXItZ3JheS03MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+SGnhu4NuIHRo4buLIGThu68gbGnhu4d1IGNobyBuZ8OgeTp7JyAnfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtuZXcgRGF0ZShzZWxlY3RlZERhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygndmktVk4nKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWREYXRlKG51bGwpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtYmx1ZS02MDAgaG92ZXI6dGV4dC1ibHVlLTcwMCBkYXJrOnRleHQtYmx1ZS00MDBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFhlbSB04bqldCBj4bqjXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtZ3JheS0zMDBcIj58PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWREYXRlKG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZpZXdNb2RlKCdtYXRyaXgnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1ncmF5LTYwMCBob3Zlcjp0ZXh0LWdyYXktOTAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIGRhcms6dGV4dC1ncmF5LTQwMCBkYXJrOmhvdmVyOnRleHQtd2hpdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwibTE1IDE4LTYtNiA2LTZcIi8+PC9zdmc+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUXVheSBs4bqhaSBC4bqjbmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3ZlcmZsb3cteC1hdXRvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInctZnVsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQgY2xhc3NOYW1lPVwiYmctZ3JheS01MCBkYXJrOmJnLWdyYXktODAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTYgcHktMyB0ZXh0LWxlZnQgdGV4dC14cyBmb250LW1lZGl1bSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTmfDoHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC02IHB5LTMgdGV4dC1sZWZ0IHRleHQteHMgZm9udC1tZWRpdW0gdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdp4budIHbDoG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC02IHB5LTMgdGV4dC1sZWZ0IHRleHQteHMgZm9udC1tZWRpdW0gdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdp4budIHJhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicHgtNiBweS0zIHRleHQtbGVmdCB0ZXh0LXhzIGZvbnQtbWVkaXVtIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBHaeG7nSBjw7RuZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTYgcHktMyB0ZXh0LWxlZnQgdGV4dC14cyBmb250LW1lZGl1bSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVHLhuqFuZyB0aMOhaVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTYgcHktMyB0ZXh0LWxlZnQgdGV4dC14cyBmb250LW1lZGl1bSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTG/huqFpIG5naOG7iVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTYgcHktMyB0ZXh0LWxlZnQgdGV4dC14cyBmb250LW1lZGl1bSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR2hpIGNow7pcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cImRpdmlkZS15IGRpdmlkZS1ncmF5LTIwMCBiZy13aGl0ZSBkYXJrOmRpdmlkZS1ncmF5LTcwMCBkYXJrOmJnLWdyYXktOTAwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZmlsdGVyZWRBdHRlbmRhbmNlcy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbFNwYW49ezd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC02IHB5LTEyIHRleHQtY2VudGVyIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgS2jDtG5nIGPDsyBk4buvIGxp4buHdSBjaOG6pW0gY8O0bmdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEF0dGVuZGFuY2VzLm1hcCgoYXR0ZW5kYW5jZSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17YXR0ZW5kYW5jZS5pZH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImhvdmVyOmJnLWdyYXktNTAgZGFyazpob3ZlcjpiZy1ncmF5LTgwMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJ3aGl0ZXNwYWNlLW5vd3JhcCBweC02IHB5LTQgdGV4dC1zbSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtuZXcgRGF0ZShhdHRlbmRhbmNlLmRhdGUpLnRvTG9jYWxlRGF0ZVN0cmluZygndmktVk4nKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2hpdGVzcGFjZS1ub3dyYXAgcHgtNiBweS00IHRleHQtc21cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGltZURpc3BsYXkgdGltZT17YXR0ZW5kYW5jZS5jaGVja0luVGltZX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2hpdGVzcGFjZS1ub3dyYXAgcHgtNiBweS00IHRleHQtc21cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGltZURpc3BsYXkgdGltZT17YXR0ZW5kYW5jZS5jaGVja091dFRpbWV9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIndoaXRlc3BhY2Utbm93cmFwIHB4LTYgcHktNCB0ZXh0LXNtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFdvcmtIb3Vyc0Rpc3BsYXkgaG91cnM9e2F0dGVuZGFuY2Uud29ya0hvdXJzfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJ3aGl0ZXNwYWNlLW5vd3JhcCBweC02IHB5LTQgdGV4dC1zbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBdHRlbmRhbmNlU3RhdHVzQmFkZ2Ugc3RhdHVzPXthdHRlbmRhbmNlLnN0YXR1c30gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2hpdGVzcGFjZS1ub3dyYXAgcHgtNiBweS00IHRleHQtc21cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGVhdmVUeXBlRGlzcGxheSBsZWF2ZVR5cGU9e2F0dGVuZGFuY2UubGVhdmVUeXBlfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC02IHB5LTQgdGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC0yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRydW5jYXRlIG1heC13LVsxNTBweF0gYmxvY2tcIiB0aXRsZT17YXR0ZW5kYW5jZS5ub3RlcyB8fCAnJ30+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YXR0ZW5kYW5jZS5ub3RlcyB8fCAn4oCUJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7LyogQ2jhu4kgY8OzIEFkbWluL1F14bqjbiBsw70gaG/hurdjIHJvbGUgcGjDuSBo4bujcCBt4bubaSB0aOG6pXkgbsO6dCBz4butYSAqL31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2F1dGhVc2VyPy5yb2xlPy5yb2xlS2V5ID09PSAnYWRtaW4nICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFZGl0RGlhbG9nUmVjb3JkKGF0dGVuZGFuY2UpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ibHVlLTYwMCBkYXJrOmhvdmVyOnRleHQtYmx1ZS00MDAgdHJhbnNpdGlvbi1jb2xvcnNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiU+G7rWEgY2jhuqVtIGPDtG5nXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RWRpdDIgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICB7LyogQXBwcm92YWxzIFRhYiAqL31cclxuICAgICAgICAgICAge2FjdGl2ZVRhYiA9PT0gJ2FwcHJvdmFscycgJiYgKFxyXG4gICAgICAgICAgICAgICAgPEF0dGVuZGFuY2VBcHByb3ZhbHNUYWJcclxuICAgICAgICAgICAgICAgICAgICBhdHRlbmRhbmNlcz17YXR0ZW5kYW5jZUxpc3R9XHJcbiAgICAgICAgICAgICAgICAgICAgdXNlcnM9e3VzZXJzfVxyXG4gICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZz17bG9hZGluZ31cclxuICAgICAgICAgICAgICAgICAgICBvbkFwcHJvdmU9e2hhbmRsZUFwcHJvdmVMZWF2ZX1cclxuICAgICAgICAgICAgICAgICAgICBvblJlamVjdD17aGFuZGxlUmVqZWN0TGVhdmV9XHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgICAgey8qIFFSIENvZGUgRGlhbG9nICovfVxyXG4gICAgICAgICAgICA8R2VuZXJhdGVRUkRpYWxvZyBpc09wZW49e3Nob3dRUkRpYWxvZ30gb25DbG9zZT17KCkgPT4gc2V0U2hvd1FSRGlhbG9nKGZhbHNlKX0gLz5cclxuXHJcbiAgICAgICAgICAgIDxSZXF1ZXN0TGVhdmVEaWFsb2cgaXNPcGVuPXtzaG93UmVxdWVzdExlYXZlfSBvbkNsb3NlPXsoKSA9PiBzZXRTaG93UmVxdWVzdExlYXZlKGZhbHNlKX0gLz5cclxuXHJcbiAgICAgICAgICAgIHsvKiBFZGl0IEF0dGVuZGFuY2UgRGlhbG9nICovfVxyXG4gICAgICAgICAgICA8QXR0ZW5kYW5jZUVkaXREaWFsb2cgXHJcbiAgICAgICAgICAgICAgICBpc09wZW49eyEhZWRpdERpYWxvZ1JlY29yZH0gXHJcbiAgICAgICAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRFZGl0RGlhbG9nUmVjb3JkKG51bGwpfSBcclxuICAgICAgICAgICAgICAgIGF0dGVuZGFuY2U9e2VkaXREaWFsb2dSZWNvcmR9XHJcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3M9e2xvYWREYXRhfVxyXG4gICAgICAgICAgICAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgKVxyXG59XHJcbiJdLCJmaWxlIjoiRDovYV90aGVtZHVhbi9jaHV5ZW5kb2lyZWFjdC9MQUItTmFtVmlldC1DbGllbnQtVjEvbmFtLXZpZXQtY2xpZW50L3NyYy92aWV3cy9hZG1pbi9hdHRlbmRhbmNlL0F0dGVuZGFuY2VQYWdlLmpzeCJ9