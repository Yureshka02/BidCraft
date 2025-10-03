import { dbConnect } from "@/lib/mongoose";
import { Project, User } from "@/models";;
import mongoose from "mongoose";
import ProjectClient from "./project-client";

type Props = { params: { id: string } };

export default async function ProjectDetailPage({ params }: Props) {
  await dbConnect();
  const id = params.id;

  if (!mongoose.isValidObjectId(id)) {
    return <div className="p-6">Invalid project id</div>;
  }

  const project = await Project.findById(id)
    .populate({ path: "buyerId", select: "email role" })
    .lean();

  if (!project) return <div className="p-6">Not found</div>;

  // serialize for client
  const data = JSON.parse(JSON.stringify(project));

  return <ProjectClient project={data} />;
}
