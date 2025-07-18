import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // サンプルユーザー作成
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-1',
      email: 'test@example.com',
      username: 'fituser1',
      bio: '筋トレ歴3年です！毎日コツコツ頑張ってます💪',
      avatarUrl:
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      id: 'test-user-2',
      email: 'user2@example.com',
      username: 'gymfan',
      bio: 'ベンチプレス100kg目指してます🔥',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
  })

  // サンプルワークアウト作成
  const workout1 = await prisma.workout.create({
    data: {
      userId: user1.id,
      name: '胸・三頭筋トレーニング',
      notes: '今日は調子が良かった！',
      duration: 90,
      exercises: {
        create: [
          {
            exerciseName: 'ベンチプレス',
            sets: 4,
            reps: [10, 8, 6, 6],
            weights: [60.0, 70.0, 80.0, 80.0],
            restSeconds: [120, 120, 180, 180],
            order: 1,
          },
          {
            exerciseName: 'ダンベルフライ',
            sets: 3,
            reps: [12, 10, 10],
            weights: [15.0, 17.5, 17.5],
            restSeconds: [90, 90, 90],
            order: 2,
          },
          {
            exerciseName: 'ディップス',
            sets: 3,
            reps: [15, 12, 10],
            weights: [0, 0, 0],
            restSeconds: [60, 60, 60],
            order: 3,
          },
        ],
      },
    },
  })

  const workout2 = await prisma.workout.create({
    data: {
      userId: user2.id,
      name: '背中・二頭筋トレーニング',
      notes: 'デッドリフトで新記録！',
      duration: 105,
      exercises: {
        create: [
          {
            exerciseName: 'デッドリフト',
            sets: 5,
            reps: [8, 6, 4, 4, 6],
            weights: [80.0, 90.0, 100.0, 100.0, 85.0],
            restSeconds: [180, 180, 240, 240, 180],
            order: 1,
          },
          {
            exerciseName: 'ラットプルダウン',
            sets: 4,
            reps: [12, 10, 10, 8],
            weights: [45.0, 50.0, 55.0, 60.0],
            restSeconds: [90, 90, 120, 120],
            order: 2,
          },
        ],
      },
    },
  })

  // サンプル投稿作成
  const post1 = await prisma.post.create({
    data: {
      userId: user1.id,
      workoutId: workout1.id,
      content:
        '今日の胸トレ完了！ベンチプレス80kgで6レップできました💪 次は85kgに挑戦したいと思います！',
      hashtags: ['胸トレ', 'ベンチプレス', '筋トレ記録'],
      imageUrl:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    },
  })

  const post2 = await prisma.post.create({
    data: {
      userId: user2.id,
      workoutId: workout2.id,
      content:
        'デッドリフト100kg達成！🔥 長い道のりでしたが、ついに大台に乗りました。継続は力なり！',
      hashtags: ['デッドリフト', '100kg達成', '背中トレ', '新記録'],
      imageUrl:
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop',
    },
  })

  const post3 = await prisma.post.create({
    data: {
      userId: user1.id,
      content:
        '筋トレ始めて1年が経ちました！体重も5kg増えて、見た目も変わってきた気がします。みんなありがとう！',
      hashtags: ['筋トレ1年', '増量', '感謝'],
    },
  })

  // サンプルいいね作成
  await prisma.like.createMany({
    data: [
      { userId: user2.id, postId: post1.id },
      { userId: user1.id, postId: post2.id },
      { userId: user2.id, postId: post3.id },
    ],
  })

  // サンプルコメント作成
  await prisma.comment.createMany({
    data: [
      {
        userId: user2.id,
        postId: post1.id,
        content: 'ナイス！80kgいけるなら85kgも余裕だと思います💪',
      },
      {
        userId: user1.id,
        postId: post2.id,
        content: '100kg達成おめでとうございます！🎉 憧れます！',
      },
      {
        userId: user2.id,
        postId: post3.id,
        content: '1年でここまで変わるのはすごいですね！努力の賜物です👏',
      },
    ],
  })

  // サンプルフォロー関係作成
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
