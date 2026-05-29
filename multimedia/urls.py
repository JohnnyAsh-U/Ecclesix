from django.urls import path
from . import views

urlpatterns = [
    path('/events/<int:event_id>', views.EventMediaFilesView.as_view(), name='event_mediafiles'),
    #Create
    path('/create', views.CreateUploadMediaFileView.as_view(), name = "upload file"),
    path('/<str:upload_id>/complete', views.CompleteUploadView.as_view(), name = "complete-download"),
    
    path('/all', views.AllMediaFilesView.as_view(), name='mediafiles_all'),
    path('/<int:pk>', views.MediaFileDetailView.as_view(), name='mediafile_detail'),
    path('/<int:pk>/download', views.MediaFileDownloadView.as_view(), name='mediafile_download'),
    path('/<int:pk>/share', views.MediaFileShareView.as_view(), name='mediafile_share'),
]
