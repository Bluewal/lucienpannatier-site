// /llms.txt (https://llmstxt.org): plain-text summary of the site for LLMs and agents
import { albums } from '../data/albums.js';

const site = 'https://lucienpannatier.ch';

export function GET() {
  const body = `# Lucien Pannatier

> Head of IT & Information Security at Croix-Rouge Valais, Switzerland. Blue Team defender: Microsoft 365 security, identity and endpoint hardening, incident response, IT risk, data governance and Swiss data-protection compliance. Homelab tinkerer, open-source and self-hosting advocate, photographer.

This is a static personal site: one page with an about section, skills, career, credentials, projects and photography, plus one page per photo album.

## Profile

- [About](${site}/#about): background, current role and how I work
- [Skills](${site}/#skills): identity & access, endpoint, threat protection, governance risk & compliance, systems & infrastructure
- [Career](${site}/#career): reverse-chronological career path
- [Credentials](${site}/#credentials): memberships, certifications, education, languages

## Projects

- [m365-intune-scripts](https://github.com/Bluewal/m365-intune-scripts): scripts for Microsoft 365 & Intune: endpoint deployment, detection and hardening
- [OpenCanary-Dashboard](https://github.com/Bluewal/OpenCanary-Dashboard): dashboard for the OpenCanary honeypot
- [GitHub profile](https://github.com/Bluewal): homelab bits, tools and experiments

## Photography

${albums.map(a => `- [${a.title}](${site}/albums/${a.slug}/): photo album`).join('\n')}

## Contact

- [Mastodon](https://infosec.exchange/@Bluewall): @Bluewall@infosec.exchange
- [X](https://x.com/Bluewall): @Bluewall
- [Email](mailto:contact@lucienpannatier.ch): contact@lucienpannatier.ch
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
