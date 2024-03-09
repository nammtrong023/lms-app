import logging
from pathlib import Path
from typing import Any, Dict

import emails
from app.config import config
from emails.template import JinjaTemplate

logger = logging.getLogger(__name__)


def config_email(
    email_to: str,
    subject_template: str = "",
    html_template: str = "",
    environment: Dict[str, Any] = {},
) -> None:
    message = emails.Message(
        subject=JinjaTemplate(subject_template),
        html=JinjaTemplate(html_template),
        mail_from=(config.EMAILS_FROM_NAME, config.EMAILS_FROM_EMAIL),
    )
    smtp_options = {
        "host": config.SMTP_HOST,
        "port": config.SMTP_PORT,
        "tls": config.SMTP_TLS,
        "user": config.SMTP_USER,
        "password": config.SMTP_PASSWORD,
    }
    message.send(to=email_to, render=environment, smtp=smtp_options)


def send_email(email_to: str, url: str, subject: str, template: str) -> None:
    with open(Path(config.EMAIL_TEMPLATES_DIR) / template) as f:
        template_str = f.read()

    config_email(
        email_to=email_to,
        subject_template=subject,
        html_template=template_str,
        environment={
            "email": email_to,
            "url": url,
        },
    )


# class MuxVideoUploader:
#     def __init__(self):
#         configuration = mux_python.Configuration(
#             username=config.MUX_TOKEN_ID,
#             password=config.MUX_TOKEN_SECRET,
#         )
#         self.assets_api = mux_python.AssetsApi(mux_python.ApiClient(configuration))

#     def create_asset(self, video_url: str):
#         try:
#             input_settings = [mux_python.InputSettings(url=video_url)]

#             create_asset_request = mux_python.CreateAssetRequest(
#                 input=input_settings,
#                 playback_policy=mux_python.PlaybackPolicy.PUBLIC,
#                 test=False,
#             )

#             create_asset_response = self.assets_api.create_asset(
#                 create_asset_request=create_asset_request
#             )
#             return create_asset_response.data
#         except ApiException as e:
#             raise HTTPException(
#                 detail=f"MUX: Failed to call the create_asset: {e}",
#                 status_code=500,
#             )

#     def delete_asset(self, asset_id: str):
#         try:
#             self.assets_api.delete_asset(asset_id=asset_id)
#         except ApiException as e:
#             raise HTTPException(
#                 detail=f"MUX: Failed to call the delete_asset: {e}",
#                 status_code=500,
#             )


# mux_uploader = MuxVideoUploader()
