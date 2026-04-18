'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link2, QrCode } from 'lucide-react'
import { QuickCreateDialog } from '@/components/user/quick-create-dialog'
import { QuickCreateResultModal } from '@/components/user/quick-create-result-modal'
import type { Link } from '@/lib/supabase'

type QuickCreateMode = 'shortlink' | 'qrcode'

export function QuickActions() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<QuickCreateMode>('shortlink')
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [createdLink, setCreatedLink] = useState<Link | null>(null)

  const handleOpenShortLink = () => {
    setDialogMode('shortlink')
    setDialogOpen(true)
  }

  const handleOpenQRCode = () => {
    setDialogMode('qrcode')
    setDialogOpen(true)
  }

  const handleSuccess = (link: Link) => {
    setCreatedLink(link)
    setDialogOpen(false)
    setResultModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleOpenShortLink}
              className="flex-1 min-w-[180px]"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Quick Create: Short Link
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenQRCode}
              className="flex-1 min-w-[180px]"
            >
              <QrCode className="mr-2 h-4 w-4" />
              Quick Create: QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <QuickCreateDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        mode={dialogMode}
        onSuccess={handleSuccess}
      />

      <QuickCreateResultModal
        open={resultModalOpen}
        onOpenChange={setResultModalOpen}
        link={createdLink}
      />
    </>
  )
}