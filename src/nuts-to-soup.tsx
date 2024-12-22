import { Detail } from "@raycast/api";
import { useFetch } from "@raycast/utils";

interface Show {
  broadcast_title: string;
  start_timestamp: string;
  end_timestamp: string;
  embeds?: {
    details?: {
      description?: string;
      genres?: Array<{ value: string }>;
      location_long?: string;
      media?: {
        picture_medium?: string;
      };
    };
  };
}

interface Channel {
  channel_name: string;
  now: Show;
  next: Show;
}

interface NTSResponse {
  results: Channel[];
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isReplay(title: string): boolean {
  return title.includes('(R)');
}

function formatShowDetails(show: Show): string {
  const details = show.embeds?.details;
  let markdown = `### ${show.broadcast_title}${isReplay(show.broadcast_title) ? ' (REPLAY)' : ''}\n`;
  markdown += `**${formatTime(show.start_timestamp)} - ${formatTime(show.end_timestamp)}**\n\n`;

  if (details?.media?.picture_medium) {
    markdown += `![Show Image](${details.media.picture_medium})\n\n`;
  }

  if (details?.description) {
    markdown += `${details.description}\n\n`;
  }

  if (details?.genres && details.genres.length > 0) {
    markdown += `**Genres:** ${details.genres.map(g => g.value).join(', ')}\n\n`;
  }

  if (details?.location_long) {
    markdown += `📍 ${details.location_long}\n\n`;
  }

  return markdown;
}

function formatMarkdown(data: NTSResponse): string {
  let content = "# NTS Now Playing\n\n";

  data.results.forEach((channel) => {
    content += `## Channel ${channel.channel_name}\n\n`;
    content += `${formatShowDetails(channel.now)}\n`;
    content += `### Up Next\n\n`;
    content += `${channel.next.broadcast_title}\n`;
    content += `${formatTime(channel.next.start_timestamp)} - ${formatTime(channel.next.end_timestamp)}\n\n`;
    content += "---\n\n";
  });

  return content;
}

export default function Command() {
  const { isLoading, data } = useFetch<NTSResponse>("https://www.nts.live/api/v2/live");
  const markdown = data ? formatMarkdown(data) : "Loading NTS Radio...";

  return <Detail markdown={markdown} isLoading={isLoading} />;
}
