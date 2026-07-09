// server/api/members/update-role.put.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { memberId, roleId } = body // roleId เป็น null ได้ถ้าต้องการถอดยศออกเป็นสมาชิกทั่วไป

  if (!memberId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีของสมาชิกที่ต้องการเปลี่ยนยศ'
    })
  }

  try {
    const updatedMember = await prisma.projectMember.update({
      where: {
        id: Number(memberId)
      },
      data: {
        roleId: roleId ? Number(roleId) : null
      },
      include: {
        role: true
      }
    })

    return {
      success: true,
      message: 'อัปเดตยศให้สมาชิกเรียบร้อยแล้ว! ⚔️',
      data: updatedMember
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถเปลี่ยนยศให้สมาชิกได้'
    })
  }
})