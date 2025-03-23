package es.gdapp.guidingApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class PageWrapperDTO<T> {
    private List<T> content;
    private int totalPages;
    private long totalElements;
    private int number;
}
