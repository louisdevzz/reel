import { createFileRoute, useParams } from "@tanstack/react-router"

export const Route = createFileRoute('/v/$videoId')({
  component: VideoPage,
})

function VideoPage() {
  const { videoId } = useParams({ from: '/v/$videoId' })
  return <div>VideoPage</div>
}