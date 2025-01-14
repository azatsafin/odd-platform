package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetVersionPojo;
import reactor.core.publisher.Mono;

public interface ReactiveDatasetVersionRepository extends ReactiveCRUDRepository<DatasetVersionPojo> {
    Mono<DatasetStructureDto> getDatasetVersion(final long datasetVersionId);

    Mono<DatasetStructureDto> getLatestDatasetVersion(final long datasetId);

    Mono<List<DatasetVersionPojo>> getVersions(final String datasetOddrn);

    Mono<List<DatasetVersionPojo>> getLatestVersions(final Collection<Long> datasetIds);

    Mono<List<DatasetVersionPojo>> getPenultimateVersions(final List<DatasetVersionPojo> lastVersions);

    Mono<Map<Long, List<DatasetFieldPojo>>> getDatasetVersionPojoIds(Set<Long> dataVersionPojoIds);
}
