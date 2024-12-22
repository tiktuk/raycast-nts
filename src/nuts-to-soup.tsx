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
        picture_thumb?: string;
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
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, { 
    hour: 'numeric',
    minute: 'numeric',
  });
}

function isReplay(title: string): boolean {
  return title.includes('(R)');
}

function formatShowDetails(show: Show, includeImage = false): string {
  const details = show.embeds?.details;
  let markdown = '';

  markdown += `### ${show.broadcast_title}${isReplay(show.broadcast_title) ? ' (REPLAY)' : ''}\n`;
  markdown += `**${formatTime(show.start_timestamp)} - ${formatTime(show.end_timestamp)}**\n`;

  if (details?.genres && details.genres.length > 0) {
    markdown += `${details.genres.map(g => g.value).join(', ')}`;
  }

  if (details?.location_long) {
    markdown += ` • 📍 ${details.location_long}`;
  }

  markdown += '\n\n';

  if (includeImage && details?.media?.picture_thumb) {
    markdown += `![](${details.media.picture_thumb})\n`;
  }

  return markdown;
}

function formatMarkdown(data: NTSResponse): string {
  let content = "# NTS Now Playing\n\n";

  // Channel information
  data.results.forEach((channel) => {
    content += `## Channel ${channel.channel_name}\n`;
    content += formatShowDetails(channel.now, false);
    content += `**Next:** ${channel.next.broadcast_title} (${formatTime(channel.next.start_timestamp)})\n\n`;
  });

  // Show images at the bottom
  content += "---\n\n";
  data.results.forEach((channel, index) => {
    if (channel.now.embeds?.details?.media?.picture_thumb) {
      content += `![Channel ${channel.channel_name}](${channel.now.embeds.details.media.picture_thumb}) `;
    }
  });

  return content;
}

export default function Command() {
  const { isLoading, data } = useFetch<NTSResponse>("https://www.nts.live/api/v2/live");
  const markdown = data ? formatMarkdown(data) : "Loading NTS Radio...";

  return <Detail markdown={markdown} isLoading={isLoading} />;
}
