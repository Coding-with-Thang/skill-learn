// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// export async function POST(req) {
//   try {
//     const { userId: clerkId } = await auth();

//     if (!clerkId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { responses } = await req.json();

//     // validate the fields
//     if (
//       !categoryId ||
//       !quizId ||
//       typeof score !== "number" ||
//       !Array.isArray(responses)
//     ) {
//       return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//     }

//     const user = await prisma.user.findUnique({ where: { clerkId } });

//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // fetch or create a categoryStat entry
//     let stat = await prisma.categoryStat.findUnique({
//       where: {
//         userId_categoryId: {
//           userId: user.id,
//           categoryId,
//         },
//       },
//     });

//     if (stat) {
//       // calculate the average score
//       const totalScore = (stat.averageScore || 0) * stat.completed + score;
//       const newAverageScore = totalScore / (stat.completed + 1);

//       // update the categoryStat entry
//       stat = await prisma.categoryStat.update({
//         where: { id: stat.id },
//         data: {
//           completed: stat.completed + 1,
//           averageScore: newAverageScore,
//           lastAttempt: new Date(),
//         },
//       });
//     } else {
//       // create a new categoryStat entry
//       stat = await prisma.categoryStat.create({
//         data: {
//           userId: user.id,
//           categoryId,
//           attempts: 1,
//           completed: 1,
//           averageScore: score,
//           lastAttempt: new Date(),
//         },
//       });
//     }

//     return NextResponse.json(stat);
//   } catch (error) {
//     console.log("Error finishing quiz: ", error);
//     return NextResponse.json(
//       { error: "Error finishing quiz" },
//       { status: 500 }
//     );
//   }
// }
// 1
//   try {
//     await client.connect();
//     const database = client.db("tic-tac-toe");
//     const history = database.collection("game-history");

//     if (req.method === "GET") {
//       const currentHistory = (await history.findOne({})) || {
//         xWins: 0,
//         oWins: 0,
//         draws: 0,
//       };
//       res.status(200).json(currentHistory);
//     } else if (req.method === "POST") {
//       const { result } = req.body;
//       const update = {};

//       if (result === "X") update.$inc = { xWins: 1 };
//       else if (result === "O") update.$inc = { oWins: 1 };
//       else if (result === "draw") update.$inc = { draws: 1 };

//       const currentHistory = await history.findOneAndUpdate({}, update, {
//         upsert: true,
//         returnDocument: "after",
//       });

//       res.status(200).json(currentHistory);
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Error connecting to database" });
//   } finally {
//     await client.close();
//   }
// }
