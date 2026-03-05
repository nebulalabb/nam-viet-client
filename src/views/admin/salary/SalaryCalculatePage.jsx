import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, LayoutBody } from "@/components/custom/Layout";
import SalaryCalculator from "./components/SalaryCalculator";
import { ArrowLeft } from "lucide-react";

export default function SalaryCalculatePage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Tính lương nhân viên";
    }, []);

    const handleSuccess = () => {
        // Navigate back to the list on success
        navigate("/salary");
    };

    const handleCancel = () => {
        navigate("/salary");
    };

    return (
        <Layout>
            <LayoutBody className="flex flex-col space-y-6 bg-gray-50" fixedHeight>
                <div className="max-w-4xl mx-auto w-full pt-4">

                    <Link
                        to="/salary"
                        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors mb-6 group bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Quay lại danh sách lương
                    </Link>

                    <div className="mb-6">
                        <h2 className="text-3xl font-black tracking-tight text-gray-900">
                            Hệ thống tính lương
                        </h2>
                        <p className="mt-2 text-gray-500 font-medium">
                            Tạo mới bảng lương cho nhân viên dựa trên ngày công, hoa hồng và tăng ca.
                        </p>
                    </div>

                    <SalaryCalculator
                        onSuccess={handleSuccess}
                        onCancel={handleCancel}
                        className="shadow-xl shadow-gray-200/50"
                    />

                </div>
            </LayoutBody>
        </Layout>
    );
}
