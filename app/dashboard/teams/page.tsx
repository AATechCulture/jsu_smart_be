import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinanceForm } from "@/components/ui/financing";
import { TeamList, TeamListSkeleton } from "@/components/teams/team-list";
import { Suspense } from "react";
import { Team } from "@prisma/client";

async function getTeams(userId: string) {
  return await prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });
}

export default async function TeamsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const teams = await getTeams(session.user.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financial Advising</h1>
        {/* Render User input form */}
      </div>

      <Card>
        <CardContent>
          <FinanceForm/>
        </CardContent>
      </Card>
    </div>
  );
}
