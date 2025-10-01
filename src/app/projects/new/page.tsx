"use client";

import { Form, Input, Button, DatePicker, InputNumber, Select, message } from "antd";
import { useRouter } from "next/navigation";

type FormValues = {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deadline: any; // Dayjs
  category: string;
};

export default function NewProjectPage() {
  const router = useRouter();

  const onFinish = async (values: FormValues) => {
    const payload = {
      ...values,
      // convert Dayjs -> ISO string for the API
      deadline: values.deadline?.toISOString?.() ?? values.deadline,
    };

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // response might not be JSON on errors like 405
        const ct = res.headers.get("content-type") || "";
        const err = ct.includes("application/json") ? await res.json() : { error: await res.text() };
        message.error(err.error || `Request failed (${res.status})`);
        return;
      }

      message.success("✅ Project posted successfully!");
      router.push("/projects");
    } catch (e) {
      message.error("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded">
      <Form<FormValues> layout="vertical" onFinish={onFinish}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="budgetMin" label="Minimum Budget" rules={[{ required: true }]}>
          <InputNumber min={1} className="w-full" />
        </Form.Item>
        <Form.Item name="budgetMax" label="Maximum Budget" rules={[{ required: true }]}>
          <InputNumber min={1} className="w-full" />
        </Form.Item>
        <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
          <DatePicker showTime className="w-full" />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "design", label: "Design" },
              { value: "writing", label: "Writing" },
              { value: "coding", label: "Coding" },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          Post Project
        </Button>
      </Form>
    </div>
  );
}
