* Create Folder to save the images of rooms and specify the created folder url in settings.py
    Example : 
    if media is the folder then path is
    MEDIA_ROOT = os.path.join(BASE_DIR.parent, 'media')
    MEDIA_URL = '/media/'
    * Specify the url pattern in urls.py also 
    if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
