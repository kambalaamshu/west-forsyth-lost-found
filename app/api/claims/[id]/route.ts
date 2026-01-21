import { NextRequest, NextResponse } from 'next/server'
import { getClaimById, updateClaimStatus, deleteClaim, updateItemStatus } from '@/lib/sqlite'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const claim = getClaimById(parseInt(id))

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json(claim)
  } catch (error) {
    console.error('Error fetching claim:', error)
    return NextResponse.json({ error: 'Failed to fetch claim' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const claimId = parseInt(id)

    const existingClaim = getClaimById(claimId)
    if (!existingClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (body.status) {
      const success = updateClaimStatus(claimId, body.status, body.admin_notes)
      if (!success) {
        return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
      }

      // If claim is approved, also update the item status to claimed
      if (body.status === 'approved') {
        updateItemStatus(existingClaim.item_id, 'claimed')
      }
    }

    const updatedClaim = getClaimById(claimId)
    return NextResponse.json(updatedClaim)
  } catch (error) {
    console.error('Error updating claim:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = deleteClaim(parseInt(id))

    if (!success) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Claim deleted successfully' })
  } catch (error) {
    console.error('Error deleting claim:', error)
    return NextResponse.json({ error: 'Failed to delete claim' }, { status: 500 })
  }
}
