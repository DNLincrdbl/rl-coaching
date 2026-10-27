"""HTML + plain-text letters in the landing's black / white language."""
from __future__ import annotations

import html


def _esc(value: str) -> str:
    return html.escape(value or "", quote=True)


def render_letter(
    *,
    eyebrow: str,
    headline: str,
    paragraphs: list[str],
    button_label: str | None = None,
    button_url: str | None = None,
    footnote: str = "",
) -> tuple[str, str]:
    """Return (plain_text, html). User-facing strings are escaped in HTML."""
    text_lines = [headline, ""]
    text_lines.extend(paragraphs)
    if button_label and button_url:
        text_lines.extend(["", f"{button_label}: {button_url}"])
    if footnote:
        text_lines.extend(["", footnote])
    text_lines.extend(["", "— RLM"])
    plain = "\n".join(text_lines)

    body_html = "".join(
        f'<p style="margin:18px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:rgba(255,255,255,0.68);">{_esc(p)}</p>'
        for p in paragraphs
    )
    button_html = ""
    if button_label and button_url:
        safe_url = _esc(button_url)
        button_html = (
            '<p style="margin:32px 0 0;">'
            f'<a href="{safe_url}" style="display:inline-block;background:#ffffff;color:#000000;'
            'text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:700;'
            f'font-size:14px;line-height:1;padding:14px 26px;border-radius:999px;">{_esc(button_label)}</a>'
            "</p>"
            f'<p style="margin:18px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.38);word-break:break-all;">'
            f'Ha a gomb nem nyílik meg: <a href="{safe_url}" style="color:rgba(255,255,255,0.55);">{safe_url}</a></p>'
        )
    footnote_html = ""
    if footnote:
        footnote_html = (
            '<p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.38);">'
            f"{_esc(footnote)}</p>"
        )

    document = f"""<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{_esc(headline)}</title>
</head>
<body style="margin:0;padding:0;background:#000000;">
  <div style="display:none;max-height:0;overflow:hidden;color:#000;">{_esc(paragraphs[0] if paragraphs else headline)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:48px 20px 56px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
          <tr>
            <td>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.45);">
                <span style="display:inline-block;width:7px;height:7px;background:#FF6A2B;border-radius:50%;margin-right:8px;vertical-align:middle;"></span>
                {_esc(eyebrow)}
              </p>
              <h1 style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:40px;line-height:0.95;letter-spacing:-0.045em;font-weight:900;color:#ffffff;">
                {_esc(headline)}
              </h1>
              {body_html}
              {button_html}
              {footnote_html}
              <p style="margin:36px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.28);">RLM</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    return plain, document
