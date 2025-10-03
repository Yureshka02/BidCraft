import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import { Project, User } from "@/models";;
import ProjectClient from "./project-client";

type Props = { params: { id: string } };

export default async function ProjectDetail({ params }: Props) {
  const { id } = params;
  if (!mongoose.isValidObjectId(id)) return notFound();

  await dbConnect();

  const project = await Project.findById(id)
    .populate({ path: "buyerId", select: "email role" })
    .lean();

  if (!project) return notFound();

  // serialize Dates/ObjectIds
  const data = JSON.parse(JSON.stringify(project));
  return <ProjectClient project={data} />;
}
