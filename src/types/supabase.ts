export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      beneficiary_group_aliases: {
        Row: {
          alias: string
          group_slug: string
        }
        Insert: {
          alias: string
          group_slug: string
        }
        Update: {
          alias?: string
          group_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_group_aliases_group_slug_fkey"
            columns: ["group_slug"]
            isOneToOne: false
            referencedRelation: "beneficiary_groups"
            referencedColumns: ["slug"]
          },
        ]
      }
      beneficiary_groups: {
        Row: {
          active: boolean
          created_at: string
          deprecated_at: string | null
          description: string
          label_pt: string
          replacement_slug: string | null
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          deprecated_at?: string | null
          description: string
          label_pt: string
          replacement_slug?: string | null
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          deprecated_at?: string | null
          description?: string
          label_pt?: string
          replacement_slug?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_groups_replacement_slug_fkey"
            columns: ["replacement_slug"]
            isOneToOne: false
            referencedRelation: "beneficiary_groups"
            referencedColumns: ["slug"]
          },
        ]
      }
      candidates: {
        Row: {
          ballot_name: string | null
          ballot_number: number | null
          candidate_type: string
          coalition: string | null
          created_at: string | null
          data_origin: string
          election_year: number
          federation: string | null
          first_seen_at: string
          full_name: string
          id: string
          last_seen_at: string
          official_profile_url: string | null
          official_source_document_id: string | null
          party: string
          photo_source_url: string | null
          photo_url: string | null
          position: string
          registration_status: string
          registration_status_updated_at: string | null
          review_status: string
          slug: string
          state: string
          tse_candidate_id: string | null
        }
        Insert: {
          ballot_name?: string | null
          ballot_number?: number | null
          candidate_type?: string
          coalition?: string | null
          created_at?: string | null
          data_origin?: string
          election_year?: number
          federation?: string | null
          first_seen_at?: string
          full_name: string
          id?: string
          last_seen_at?: string
          official_profile_url?: string | null
          official_source_document_id?: string | null
          party: string
          photo_source_url?: string | null
          photo_url?: string | null
          position: string
          registration_status?: string
          registration_status_updated_at?: string | null
          review_status?: string
          slug: string
          state?: string
          tse_candidate_id?: string | null
        }
        Update: {
          ballot_name?: string | null
          ballot_number?: number | null
          candidate_type?: string
          coalition?: string | null
          created_at?: string | null
          data_origin?: string
          election_year?: number
          federation?: string | null
          first_seen_at?: string
          full_name?: string
          id?: string
          last_seen_at?: string
          official_profile_url?: string | null
          official_source_document_id?: string | null
          party?: string
          photo_source_url?: string | null
          photo_url?: string | null
          position?: string
          registration_status?: string
          registration_status_updated_at?: string | null
          review_status?: string
          slug?: string
          state?: string
          tse_candidate_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_official_source_document_id_fkey"
            columns: ["official_source_document_id"]
            isOneToOne: false
            referencedRelation: "raw_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_official_source_document_id_fkey"
            columns: ["official_source_document_id"]
            isOneToOne: false
            referencedRelation: "raw_documents_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          candidate_id: string | null
          category: string
          confidence_score: number
          content: string
          created_at: string | null
          id: string
          previous_version_id: string | null
          published_at: string | null
          source_char_offset: number | null
          source_document_id: string | null
          status: string
        }
        Insert: {
          candidate_id?: string | null
          category: string
          confidence_score: number
          content: string
          created_at?: string | null
          id?: string
          previous_version_id?: string | null
          published_at?: string | null
          source_char_offset?: number | null
          source_document_id?: string | null
          status?: string
        }
        Update: {
          candidate_id?: string | null
          category?: string
          confidence_score?: number
          content?: string
          created_at?: string | null
          id?: string
          previous_version_id?: string | null
          published_at?: string | null
          source_char_offset?: number | null
          source_document_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
        ]
      }
      editor_roles: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      editorial_reviews: {
        Row: {
          claim_id: string | null
          decision: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewer_id: string | null
        }
        Insert: {
          claim_id?: string | null
          decision: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Update: {
          claim_id?: string | null
          decision?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_reviews_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "claims"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_assessment_sources: {
        Row: {
          assessment_id: string
          source_reference_id: string
        }
        Insert: {
          assessment_id: string
          source_reference_id: string
        }
        Update: {
          assessment_id?: string
          source_reference_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_assessment_sources_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "impact_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_assessment_sources_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_assessments: {
        Row: {
          confidence: number
          created_at: string
          defending_vote: string | null
          group_slug: string
          id: string
          impact_direction: string
          impact_matrix_id: string
          rationale: string
          updated_at: string
        }
        Insert: {
          confidence: number
          created_at?: string
          defending_vote?: string | null
          group_slug: string
          id?: string
          impact_direction: string
          impact_matrix_id: string
          rationale: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          created_at?: string
          defending_vote?: string | null
          group_slug?: string
          id?: string
          impact_direction?: string
          impact_matrix_id?: string
          rationale?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_assessments_group_slug_fkey"
            columns: ["group_slug"]
            isOneToOne: false
            referencedRelation: "beneficiary_groups"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "impact_assessments_impact_matrix_id_fkey"
            columns: ["impact_matrix_id"]
            isOneToOne: false
            referencedRelation: "impact_matrices"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_contestations: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          source_reference_id: string | null
          status: string
          submitted_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          source_reference_id?: string | null
          status?: string
          submitted_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          source_reference_id?: string | null
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_contestations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "impact_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_contestations_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_matrices: {
        Row: {
          approved_at: string | null
          created_at: string
          generated_by_ai: boolean
          id: string
          methodology_version: string
          proposition_version_id: string
          review_status: string
          schema_version: string
          severity: number
          structural_type: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          generated_by_ai?: boolean
          id?: string
          methodology_version: string
          proposition_version_id: string
          review_status?: string
          schema_version: string
          severity: number
          structural_type: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          generated_by_ai?: boolean
          id?: string
          methodology_version?: string
          proposition_version_id?: string
          review_status?: string
          schema_version?: string
          severity?: number
          structural_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_matrices_proposition_version_id_fkey"
            columns: ["proposition_version_id"]
            isOneToOne: false
            referencedRelation: "proposition_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_reviews: {
        Row: {
          assessment_id: string | null
          decision: string
          id: string
          impact_matrix_id: string
          notes: string | null
          panel_id: string | null
          reviewed_at: string
          reviewer_id: string | null
          reviewer_type: string
        }
        Insert: {
          assessment_id?: string | null
          decision: string
          id?: string
          impact_matrix_id: string
          notes?: string | null
          panel_id?: string | null
          reviewed_at?: string
          reviewer_id?: string | null
          reviewer_type: string
        }
        Update: {
          assessment_id?: string | null
          decision?: string
          id?: string
          impact_matrix_id?: string
          notes?: string | null
          panel_id?: string | null
          reviewed_at?: string
          reviewer_id?: string | null
          reviewer_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_reviews_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "impact_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_reviews_impact_matrix_id_fkey"
            columns: ["impact_matrix_id"]
            isOneToOne: false
            referencedRelation: "impact_matrices"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_errors: {
        Row: {
          error_message: string
          id: string
          occurred_at: string | null
          resolved: boolean | null
          source_name: string
        }
        Insert: {
          error_message: string
          id?: string
          occurred_at?: string | null
          resolved?: boolean | null
          source_name: string
        }
        Update: {
          error_message?: string
          id?: string
          occurred_at?: string | null
          resolved?: boolean | null
          source_name?: string
        }
        Relationships: []
      }
      legislative_propositions: {
        Row: {
          created_at: string
          external_id: string
          house: string
          id: string
          number: number
          official_url: string | null
          proposition_type: string
          summary: string | null
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          external_id: string
          house: string
          id?: string
          number: number
          official_url?: string | null
          proposition_type: string
          summary?: string | null
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          external_id?: string
          house?: string
          id?: string
          number?: number
          official_url?: string | null
          proposition_type?: string
          summary?: string | null
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      legislative_votes: {
        Row: {
          absence_type: string | null
          candidate_id: string | null
          created_at: string
          id: string
          legislator_id: string | null
          recorded_at: string
          source_reference_id: string | null
          value: string
          voting_event_id: string
        }
        Insert: {
          absence_type?: string | null
          candidate_id?: string | null
          created_at?: string
          id?: string
          legislator_id?: string | null
          recorded_at: string
          source_reference_id?: string | null
          value: string
          voting_event_id: string
        }
        Update: {
          absence_type?: string | null
          candidate_id?: string | null
          created_at?: string
          id?: string
          legislator_id?: string | null
          recorded_at?: string
          source_reference_id?: string | null
          value?: string
          voting_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legislative_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legislative_votes_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legislative_votes_voting_event_id_fkey"
            columns: ["voting_event_id"]
            isOneToOne: false
            referencedRelation: "voting_events"
            referencedColumns: ["id"]
          },
        ]
      }
      proposition_versions: {
        Row: {
          created_at: string
          effective_from: string
          id: string
          proposition_id: string
          source_reference_id: string | null
          text_hash: string
          version_key: string
          version_label: string
        }
        Insert: {
          created_at?: string
          effective_from: string
          id?: string
          proposition_id: string
          source_reference_id?: string | null
          text_hash: string
          version_key: string
          version_label: string
        }
        Update: {
          created_at?: string
          effective_from?: string
          id?: string
          proposition_id?: string
          source_reference_id?: string | null
          text_hash?: string
          version_key?: string
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposition_versions_proposition_id_fkey"
            columns: ["proposition_id"]
            isOneToOne: false
            referencedRelation: "legislative_propositions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposition_versions_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_documents: {
        Row: {
          content_hash: string
          fetched_at: string
          id: string
          raw_content: string
          source_category: string
          source_name: string
          url: string | null
        }
        Insert: {
          content_hash: string
          fetched_at?: string
          id?: string
          raw_content: string
          source_category: string
          source_name: string
          url?: string | null
        }
        Update: {
          content_hash?: string
          fetched_at?: string
          id?: string
          raw_content?: string
          source_category?: string
          source_name?: string
          url?: string | null
        }
        Relationships: []
      }
      source_references: {
        Row: {
          content_hash: string
          fetched_at: string
          id: string
          published_at: string | null
          source_category: string
          source_name: string
          title: string | null
          url: string | null
        }
        Insert: {
          content_hash: string
          fetched_at?: string
          id?: string
          published_at?: string | null
          source_category: string
          source_name: string
          title?: string | null
          url?: string | null
        }
        Update: {
          content_hash?: string
          fetched_at?: string
          id?: string
          published_at?: string | null
          source_category?: string
          source_name?: string
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      tse_candidates_complementar_staging: {
        Row: {
          ano_eleicao: number
          cd_cor_raca_fefc: number | null
          cd_detalhe_situacao_cand: number | null
          cd_eleicao: number | null
          cd_etnia_indigena: number | null
          cd_genero_fefc: number | null
          cd_municipio_nascimento: number | null
          cd_nacionalidade: number | null
          cd_situacao_candidato_pleito: number | null
          cd_situacao_candidato_tot: number | null
          cd_situacao_candidato_urna: number | null
          cd_situacao_cassacao: number | null
          cd_situacao_cassacao_midia: number | null
          cd_situacao_diploma: number | null
          cd_situacao_julgamento: number | null
          cd_situacao_julgamento_pleito: number | null
          cd_situacao_julgamento_urna: number | null
          ds_cor_raca_fefc: string | null
          ds_detalhe_situacao_cand: string | null
          ds_etnia_indigena: string | null
          ds_genero_fefc: string | null
          ds_nacionalidade: string | null
          ds_situacao_candidato_pleito: string | null
          ds_situacao_candidato_tot: string | null
          ds_situacao_candidato_urna: string | null
          ds_situacao_cassacao: string | null
          ds_situacao_cassacao_midia: string | null
          ds_situacao_diploma: string | null
          ds_situacao_julgamento: string | null
          ds_situacao_julgamento_pleito: string | null
          ds_situacao_julgamento_urna: string | null
          dt_aceite_candidatura: string | null
          dt_geracao: string | null
          hh_geracao: string | null
          id: number
          imported_at: string
          nm_municipio_nascimento: string | null
          nm_tipo_destinacao_votos: string | null
          nr_idade_data_posse: number | null
          nr_processo: string | null
          nr_protocolo_candidatura: string | null
          source_file: string
          sq_candidato: string
          sq_ordem_suplencia: number | null
          sq_substituido: string | null
          st_candidato_inserido_urna: boolean | null
          st_declarar_bens: boolean | null
          st_prest_contas: boolean | null
          st_quilombola: boolean | null
          st_reeleicao: boolean | null
          st_substituido: boolean | null
          vr_despesa_max_campanha: number | null
        }
        Insert: {
          ano_eleicao: number
          cd_cor_raca_fefc?: number | null
          cd_detalhe_situacao_cand?: number | null
          cd_eleicao?: number | null
          cd_etnia_indigena?: number | null
          cd_genero_fefc?: number | null
          cd_municipio_nascimento?: number | null
          cd_nacionalidade?: number | null
          cd_situacao_candidato_pleito?: number | null
          cd_situacao_candidato_tot?: number | null
          cd_situacao_candidato_urna?: number | null
          cd_situacao_cassacao?: number | null
          cd_situacao_cassacao_midia?: number | null
          cd_situacao_diploma?: number | null
          cd_situacao_julgamento?: number | null
          cd_situacao_julgamento_pleito?: number | null
          cd_situacao_julgamento_urna?: number | null
          ds_cor_raca_fefc?: string | null
          ds_detalhe_situacao_cand?: string | null
          ds_etnia_indigena?: string | null
          ds_genero_fefc?: string | null
          ds_nacionalidade?: string | null
          ds_situacao_candidato_pleito?: string | null
          ds_situacao_candidato_tot?: string | null
          ds_situacao_candidato_urna?: string | null
          ds_situacao_cassacao?: string | null
          ds_situacao_cassacao_midia?: string | null
          ds_situacao_diploma?: string | null
          ds_situacao_julgamento?: string | null
          ds_situacao_julgamento_pleito?: string | null
          ds_situacao_julgamento_urna?: string | null
          dt_aceite_candidatura?: string | null
          dt_geracao?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_municipio_nascimento?: string | null
          nm_tipo_destinacao_votos?: string | null
          nr_idade_data_posse?: number | null
          nr_processo?: string | null
          nr_protocolo_candidatura?: string | null
          source_file: string
          sq_candidato: string
          sq_ordem_suplencia?: number | null
          sq_substituido?: string | null
          st_candidato_inserido_urna?: boolean | null
          st_declarar_bens?: boolean | null
          st_prest_contas?: boolean | null
          st_quilombola?: boolean | null
          st_reeleicao?: boolean | null
          st_substituido?: boolean | null
          vr_despesa_max_campanha?: number | null
        }
        Update: {
          ano_eleicao?: number
          cd_cor_raca_fefc?: number | null
          cd_detalhe_situacao_cand?: number | null
          cd_eleicao?: number | null
          cd_etnia_indigena?: number | null
          cd_genero_fefc?: number | null
          cd_municipio_nascimento?: number | null
          cd_nacionalidade?: number | null
          cd_situacao_candidato_pleito?: number | null
          cd_situacao_candidato_tot?: number | null
          cd_situacao_candidato_urna?: number | null
          cd_situacao_cassacao?: number | null
          cd_situacao_cassacao_midia?: number | null
          cd_situacao_diploma?: number | null
          cd_situacao_julgamento?: number | null
          cd_situacao_julgamento_pleito?: number | null
          cd_situacao_julgamento_urna?: number | null
          ds_cor_raca_fefc?: string | null
          ds_detalhe_situacao_cand?: string | null
          ds_etnia_indigena?: string | null
          ds_genero_fefc?: string | null
          ds_nacionalidade?: string | null
          ds_situacao_candidato_pleito?: string | null
          ds_situacao_candidato_tot?: string | null
          ds_situacao_candidato_urna?: string | null
          ds_situacao_cassacao?: string | null
          ds_situacao_cassacao_midia?: string | null
          ds_situacao_diploma?: string | null
          ds_situacao_julgamento?: string | null
          ds_situacao_julgamento_pleito?: string | null
          ds_situacao_julgamento_urna?: string | null
          dt_aceite_candidatura?: string | null
          dt_geracao?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_municipio_nascimento?: string | null
          nm_tipo_destinacao_votos?: string | null
          nr_idade_data_posse?: number | null
          nr_processo?: string | null
          nr_protocolo_candidatura?: string | null
          source_file?: string
          sq_candidato?: string
          sq_ordem_suplencia?: number | null
          sq_substituido?: string | null
          st_candidato_inserido_urna?: boolean | null
          st_declarar_bens?: boolean | null
          st_prest_contas?: boolean | null
          st_quilombola?: boolean | null
          st_reeleicao?: boolean | null
          st_substituido?: boolean | null
          vr_despesa_max_campanha?: number | null
        }
        Relationships: []
      }
      tse_candidates_staging: {
        Row: {
          ano_eleicao: number
          cd_cargo: number | null
          cd_cor_raca: number | null
          cd_eleicao: number | null
          cd_estado_civil: number | null
          cd_genero: number | null
          cd_grau_instrucao: number | null
          cd_ocupacao: number | null
          cd_sit_tot_turno: number | null
          cd_situacao_candidatura: number | null
          cd_tipo_eleicao: number | null
          ds_cargo: string | null
          ds_composicao_coligacao: string | null
          ds_composicao_federacao: string | null
          ds_cor_raca: string | null
          ds_eleicao: string | null
          ds_email: string | null
          ds_estado_civil: string | null
          ds_genero: string | null
          ds_grau_instrucao: string | null
          ds_ocupacao: string | null
          ds_sit_tot_turno: string | null
          ds_situacao_candidatura: string | null
          dt_eleicao: string | null
          dt_geracao: string | null
          dt_nascimento: string | null
          hh_geracao: string | null
          id: number
          imported_at: string
          nm_candidato: string | null
          nm_coligacao: string | null
          nm_federacao: string | null
          nm_partido: string | null
          nm_social_candidato: string | null
          nm_tipo_eleicao: string | null
          nm_ue: string | null
          nm_urna_candidato: string | null
          nr_candidato: number | null
          nr_cpf_candidato: string | null
          nr_federacao: number | null
          nr_partido: number | null
          nr_titulo_eleitoral_candidato: string | null
          nr_turno: number | null
          raw_hash: string | null
          sg_federacao: string | null
          sg_partido: string | null
          sg_ue: string | null
          sg_uf: string
          sg_uf_nascimento: string | null
          source_dataset_hash: string | null
          source_file: string
          sq_candidato: string
          sq_coligacao: number | null
          tp_abrangencia: string | null
          tp_agremiacao: string | null
        }
        Insert: {
          ano_eleicao: number
          cd_cargo?: number | null
          cd_cor_raca?: number | null
          cd_eleicao?: number | null
          cd_estado_civil?: number | null
          cd_genero?: number | null
          cd_grau_instrucao?: number | null
          cd_ocupacao?: number | null
          cd_sit_tot_turno?: number | null
          cd_situacao_candidatura?: number | null
          cd_tipo_eleicao?: number | null
          ds_cargo?: string | null
          ds_composicao_coligacao?: string | null
          ds_composicao_federacao?: string | null
          ds_cor_raca?: string | null
          ds_eleicao?: string | null
          ds_email?: string | null
          ds_estado_civil?: string | null
          ds_genero?: string | null
          ds_grau_instrucao?: string | null
          ds_ocupacao?: string | null
          ds_sit_tot_turno?: string | null
          ds_situacao_candidatura?: string | null
          dt_eleicao?: string | null
          dt_geracao?: string | null
          dt_nascimento?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_candidato?: string | null
          nm_coligacao?: string | null
          nm_federacao?: string | null
          nm_partido?: string | null
          nm_social_candidato?: string | null
          nm_tipo_eleicao?: string | null
          nm_ue?: string | null
          nm_urna_candidato?: string | null
          nr_candidato?: number | null
          nr_cpf_candidato?: string | null
          nr_federacao?: number | null
          nr_partido?: number | null
          nr_titulo_eleitoral_candidato?: string | null
          nr_turno?: number | null
          raw_hash?: string | null
          sg_federacao?: string | null
          sg_partido?: string | null
          sg_ue?: string | null
          sg_uf: string
          sg_uf_nascimento?: string | null
          source_dataset_hash?: string | null
          source_file: string
          sq_candidato: string
          sq_coligacao?: number | null
          tp_abrangencia?: string | null
          tp_agremiacao?: string | null
        }
        Update: {
          ano_eleicao?: number
          cd_cargo?: number | null
          cd_cor_raca?: number | null
          cd_eleicao?: number | null
          cd_estado_civil?: number | null
          cd_genero?: number | null
          cd_grau_instrucao?: number | null
          cd_ocupacao?: number | null
          cd_sit_tot_turno?: number | null
          cd_situacao_candidatura?: number | null
          cd_tipo_eleicao?: number | null
          ds_cargo?: string | null
          ds_composicao_coligacao?: string | null
          ds_composicao_federacao?: string | null
          ds_cor_raca?: string | null
          ds_eleicao?: string | null
          ds_email?: string | null
          ds_estado_civil?: string | null
          ds_genero?: string | null
          ds_grau_instrucao?: string | null
          ds_ocupacao?: string | null
          ds_sit_tot_turno?: string | null
          ds_situacao_candidatura?: string | null
          dt_eleicao?: string | null
          dt_geracao?: string | null
          dt_nascimento?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_candidato?: string | null
          nm_coligacao?: string | null
          nm_federacao?: string | null
          nm_partido?: string | null
          nm_social_candidato?: string | null
          nm_tipo_eleicao?: string | null
          nm_ue?: string | null
          nm_urna_candidato?: string | null
          nr_candidato?: number | null
          nr_cpf_candidato?: string | null
          nr_federacao?: number | null
          nr_partido?: number | null
          nr_titulo_eleitoral_candidato?: string | null
          nr_turno?: number | null
          raw_hash?: string | null
          sg_federacao?: string | null
          sg_partido?: string | null
          sg_ue?: string | null
          sg_uf?: string
          sg_uf_nascimento?: string | null
          source_dataset_hash?: string | null
          source_file?: string
          sq_candidato?: string
          sq_coligacao?: number | null
          tp_abrangencia?: string | null
          tp_agremiacao?: string | null
        }
        Relationships: []
      }
      tse_coligacoes_staging: {
        Row: {
          ano_eleicao: number
          cd_cargo: number | null
          cd_eleicao: number | null
          cd_situacao_legenda: number | null
          cd_tipo_eleicao: number | null
          ds_cargo: string | null
          ds_composicao_coligacao: string | null
          ds_composicao_federacao: string | null
          ds_eleicao: string | null
          ds_situacao: string | null
          dt_eleicao: string | null
          dt_geracao: string | null
          hh_geracao: string | null
          id: number
          imported_at: string
          nm_coligacao: string | null
          nm_federacao: string | null
          nm_partido: string | null
          nm_tipo_destinacao_votos: string | null
          nm_tipo_eleicao: string | null
          nm_ue: string | null
          nr_federacao: number | null
          nr_partido: number | null
          nr_turno: number | null
          sg_federacao: string | null
          sg_partido: string | null
          sg_ue: string | null
          sg_uf: string
          source_file: string
          sq_coligacao: number | null
          tp_agremiacao: string | null
        }
        Insert: {
          ano_eleicao: number
          cd_cargo?: number | null
          cd_eleicao?: number | null
          cd_situacao_legenda?: number | null
          cd_tipo_eleicao?: number | null
          ds_cargo?: string | null
          ds_composicao_coligacao?: string | null
          ds_composicao_federacao?: string | null
          ds_eleicao?: string | null
          ds_situacao?: string | null
          dt_eleicao?: string | null
          dt_geracao?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_coligacao?: string | null
          nm_federacao?: string | null
          nm_partido?: string | null
          nm_tipo_destinacao_votos?: string | null
          nm_tipo_eleicao?: string | null
          nm_ue?: string | null
          nr_federacao?: number | null
          nr_partido?: number | null
          nr_turno?: number | null
          sg_federacao?: string | null
          sg_partido?: string | null
          sg_ue?: string | null
          sg_uf: string
          source_file: string
          sq_coligacao?: number | null
          tp_agremiacao?: string | null
        }
        Update: {
          ano_eleicao?: number
          cd_cargo?: number | null
          cd_eleicao?: number | null
          cd_situacao_legenda?: number | null
          cd_tipo_eleicao?: number | null
          ds_cargo?: string | null
          ds_composicao_coligacao?: string | null
          ds_composicao_federacao?: string | null
          ds_eleicao?: string | null
          ds_situacao?: string | null
          dt_eleicao?: string | null
          dt_geracao?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_coligacao?: string | null
          nm_federacao?: string | null
          nm_partido?: string | null
          nm_tipo_destinacao_votos?: string | null
          nm_tipo_eleicao?: string | null
          nm_ue?: string | null
          nr_federacao?: number | null
          nr_partido?: number | null
          nr_turno?: number | null
          sg_federacao?: string | null
          sg_partido?: string | null
          sg_ue?: string | null
          sg_uf?: string
          source_file?: string
          sq_coligacao?: number | null
          tp_agremiacao?: string | null
        }
        Relationships: []
      }
      tse_vagas_staging: {
        Row: {
          ano_eleicao: number
          cd_cargo: number | null
          cd_eleicao: number | null
          cd_tipo_eleicao: number | null
          ds_cargo: string | null
          ds_eleicao: string | null
          dt_eleicao: string | null
          dt_geracao: string | null
          hh_geracao: string | null
          id: number
          imported_at: string
          nm_tipo_eleicao: string | null
          nm_ue: string | null
          nr_turno: number | null
          qt_vagas: number | null
          sg_ue: string | null
          sg_uf: string
          source_file: string
          tp_abrangencia: string | null
        }
        Insert: {
          ano_eleicao: number
          cd_cargo?: number | null
          cd_eleicao?: number | null
          cd_tipo_eleicao?: number | null
          ds_cargo?: string | null
          ds_eleicao?: string | null
          dt_eleicao?: string | null
          dt_geracao?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_tipo_eleicao?: string | null
          nm_ue?: string | null
          nr_turno?: number | null
          qt_vagas?: number | null
          sg_ue?: string | null
          sg_uf: string
          source_file: string
          tp_abrangencia?: string | null
        }
        Update: {
          ano_eleicao?: number
          cd_cargo?: number | null
          cd_eleicao?: number | null
          cd_tipo_eleicao?: number | null
          ds_cargo?: string | null
          ds_eleicao?: string | null
          dt_eleicao?: string | null
          dt_geracao?: string | null
          hh_geracao?: string | null
          id?: number
          imported_at?: string
          nm_tipo_eleicao?: string | null
          nm_ue?: string | null
          nr_turno?: number | null
          qt_vagas?: number | null
          sg_ue?: string | null
          sg_uf?: string
          source_file?: string
          tp_abrangencia?: string | null
        }
        Relationships: []
      }
      voting_events: {
        Row: {
          created_at: string
          external_id: string
          house: string
          id: string
          occurred_at: string
          proposition_version_id: string
          session_id: string | null
          source_reference_id: string | null
          vote_round: string | null
        }
        Insert: {
          created_at?: string
          external_id: string
          house: string
          id?: string
          occurred_at: string
          proposition_version_id: string
          session_id?: string | null
          source_reference_id?: string | null
          vote_round?: string | null
        }
        Update: {
          created_at?: string
          external_id?: string
          house?: string
          id?: string
          occurred_at?: string
          proposition_version_id?: string
          session_id?: string | null
          source_reference_id?: string | null
          vote_round?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voting_events_proposition_version_id_fkey"
            columns: ["proposition_version_id"]
            isOneToOne: false
            referencedRelation: "proposition_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_events_source_reference_id_fkey"
            columns: ["source_reference_id"]
            isOneToOne: false
            referencedRelation: "source_references"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      raw_documents_metadata: {
        Row: {
          content_hash: string | null
          fetched_at: string | null
          id: string | null
          source_category: string | null
          source_name: string | null
          url: string | null
        }
        Insert: {
          content_hash?: string | null
          fetched_at?: string | null
          id?: string | null
          source_category?: string | null
          source_name?: string | null
          url?: string | null
        }
        Update: {
          content_hash?: string | null
          fetched_at?: string | null
          id?: string | null
          source_category?: string | null
          source_name?: string | null
          url?: string | null
        }
        Relationships: []
      }
      tse_candidates_for_upsert: {
        Row: {
          ballot_name: string | null
          ballot_number: number | null
          coalition: string | null
          federation: string | null
          full_name: string | null
          imported_at: string | null
          party: string | null
          position: string | null
          registration_status: string | null
          sq_candidato: string | null
          state: string | null
          tse_candidate_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_impact_matrix: {
        Args: { p_matrix_id: string }
        Returns: {
          approved_at: string | null
          created_at: string
          generated_by_ai: boolean
          id: string
          methodology_version: string
          proposition_version_id: string
          review_status: string
          schema_version: string
          severity: number
          structural_type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "impact_matrices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assert_editorial_actor: { Args: never; Returns: undefined }
      candidate_public_slug: {
        Args: { candidate_name: string; candidate_tse_id: string }
        Returns: string
      }
      claim_has_approved_review: {
        Args: { p_claim_id: string }
        Returns: boolean
      }
      correct_claim: {
        Args: { p_claim_id: string; p_content: string; p_notes?: string }
        Returns: {
          candidate_id: string | null
          category: string
          confidence_score: number
          content: string
          created_at: string | null
          id: string
          previous_version_id: string | null
          published_at: string | null
          source_char_offset: number | null
          source_document_id: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_admin_role: { Args: { uid?: string }; Returns: boolean }
      has_editor_role: { Args: { uid?: string }; Returns: boolean }
      impact_matrix_has_blocking_contestation: {
        Args: { p_matrix_id: string }
        Returns: boolean
      }
      impact_matrix_has_external_approval: {
        Args: { p_matrix_id: string }
        Returns: boolean
      }
      impact_matrix_has_internal_approval: {
        Args: { p_matrix_id: string }
        Returns: boolean
      }
      normalize_candidate_slug: { Args: { input: string }; Returns: string }
      publish_claim: {
        Args: { p_claim_id: string }
        Returns: {
          candidate_id: string | null
          category: string
          confidence_score: number
          content: string
          created_at: string | null
          id: string
          previous_version_id: string | null
          published_at: string | null
          source_char_offset: number | null
          source_document_id: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      retract_claim: {
        Args: { p_claim_id: string; p_notes?: string }
        Returns: {
          candidate_id: string | null
          category: string
          confidence_score: number
          content: string
          created_at: string | null
          id: string
          previous_version_id: string | null
          published_at: string | null
          source_char_offset: number | null
          source_document_id: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rpc_upsert_candidates: {
        Args: {
          coverage_complete?: boolean
          dry_run?: boolean
          uf_filter?: string
        }
        Returns: Json
      }
      upsert_candidates_from_staging: {
        Args: {
          coverage_complete?: boolean
          dry_run?: boolean
          uf_filter?: string
        }
        Returns: {
          acao: string
          ballot_number: number
          full_name: string
          party: string
          posicao: string
          registration_status: string
          sq_candidato: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

