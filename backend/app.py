# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend (CORS enabled)

@app.route('/api/download-options', methods=['POST'])
def get_download_options():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        ydl_opts = {
            'quiet': True,
            'skip_download': True,
            'forcejson': True,
            'extract_flat': False,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        formats = info.get('formats', [])
        filtered_formats = []

        for fmt in formats:
            if fmt.get('vcodec') != 'none' and fmt.get('acodec') != 'none':
                filtered_formats.append({
                    'quality': fmt.get('format_note') or fmt.get('height'),
                    'format_id': fmt.get('format_id'),
                    'ext': fmt.get('ext'),
                    'filesize': round((fmt.get('filesize', 0) or 0) / 1024 / 1024, 1),
                    'url': fmt.get('url')
                })

        # Sort highest to lowest quality
        filtered_formats = sorted(filtered_formats, key=lambda x: x['filesize'], reverse=True)

        return jsonify({
            'title': info.get('title'),
            'thumbnail': info.get('thumbnail'),
            'formats': filtered_formats
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
