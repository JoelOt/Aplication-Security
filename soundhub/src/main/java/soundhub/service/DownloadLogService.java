package soundhub.service;


import org.springframework.stereotype.Service;
import soundhub.model.AudioPost;
import soundhub.model.DownloadLog;
import soundhub.model.Users;
import soundhub.repository.DownloadLogRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DownloadLogService {

    private final DownloadLogRepository downloadLogRepository;

    public DownloadLogService(DownloadLogRepository downloadLogRepository) {
        this.downloadLogRepository = downloadLogRepository;
    }

    public DownloadLog logDownload(Users user, AudioPost audioPost) {
        DownloadLog log = new DownloadLog();
        log.setUser(user);
        log.setAudioPost(audioPost);
        log.setDownloadedAt(LocalDateTime.now());

        return downloadLogRepository.save(log);
    }

    public List<DownloadLog> getLogsByUser(Users user) {
        return downloadLogRepository.findByUser(user);
    }

    public List<DownloadLog> getLogsByAudioPost(AudioPost audioPost) {
        return downloadLogRepository.findByAudioPost(audioPost);
    }
}